import React from 'react'

const API_BASE = 'https://dummyjson.com/products/search'

function formatPrice(value, currency = 'BRL') {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `R$ ${Number(value || 0).toFixed(2)}`
  }
}

async function fetchWithChaos({ query, chaosEnabled, signal }) {
  const simulatedNetworkDelay = 200 + Math.random() * 1800

  if (chaosEnabled) {
    await new Promise((resolve) => setTimeout(resolve, simulatedNetworkDelay))
    throw new Error(
      'Chaos Monkey: falha artificial injetada na integração com o Mercado Livre.',
    )
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  const startedAt = performance.now()

  try {
    // Se a query estiver vazia, usa "laptops" para garantir resultados
    const searchTerm = query || 'laptops'

    const response = await fetch(
      `${API_BASE}?q=${encodeURIComponent(searchTerm)}`,
      {
        signal: signal || controller.signal,
      },
    )

    const networkDuration = performance.now() - startedAt

    if (!response.ok) {
      const message =
        response.status === 404
          ? 'Nenhum produto encontrado (404).'
          : `Erro de API de produtos (${response.status}).`
      const error = new Error(message)
      error.status = response.status
      error.latency = networkDuration
      throw error
    }

    const data = await response.json()

    await new Promise((resolve) => setTimeout(resolve, simulatedNetworkDelay))

    return {
      raw: data,
      latency: networkDuration + simulatedNetworkDelay,
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      const abortError = new Error(
        'Tempo limite de resposta excedido. Verifique sua conexão de rede.',
      )
      abortError.code = 'TIMEOUT'
      abortError.latency = 8000 + simulatedNetworkDelay
      throw abortError
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export function useMarketplaceData({ query, chaosEnabled }) {
  const [state, setState] = React.useState({
    products: [],
    loading: false,
    error: null,
    stats: {
      successCount: 0,
      errorCount: 0,
      lastLatency: null,
      lastUpdatedSecondsAgo: null,
      lastUpdatedAt: null,
      lastQuery: '',
    },
  })

  const lastQueryRef = React.useRef(query)
  const abortRef = React.useRef(null)

  const updateRelativeTime = React.useCallback(() => {
    setState((current) => {
      if (!current.stats.lastUpdatedAt) return current
      const diffMs = Date.now() - current.stats.lastUpdatedAt
      const diffSeconds = Math.round(diffMs / 1000)
      return {
        ...current,
        stats: {
          ...current.stats,
          lastUpdatedSecondsAgo: diffSeconds,
        },
      }
    })
  }, [])

  React.useEffect(() => {
    const intervalId = setInterval(updateRelativeTime, 4000)
    return () => clearInterval(intervalId)
  }, [updateRelativeTime])

  const performFetch = React.useCallback(
    async (explicitQuery) => {
      const effectiveQuery = explicitQuery ?? lastQueryRef.current ?? query
      if (!effectiveQuery) return

      if (abortRef.current) {
        abortRef.current.abort()
      }

      const controller = new AbortController()
      abortRef.current = controller

      setState((current) => ({
        ...current,
        loading: true,
        error: null,
      }))

      try {
        const { raw, latency } = await fetchWithChaos({
          query: effectiveQuery,
          chaosEnabled,
          signal: controller.signal,
        })

        // DummyJSON retorna { products: [...] }
        // Mantemos a ideia de adaptação de dados, mas com o novo shape
        const mappedProducts = (raw?.products || [])
          .slice(0, 16)
          .map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            priceFormatted: formatPrice(item.price, 'BRL'),
            thumbnail: item.thumbnail || '',
            description: item.description,
          }))

        const now = Date.now()

        setState((current) => ({
          ...current,
          products: mappedProducts,
          loading: false,
          error: null,
          stats: {
            ...current.stats,
            successCount: current.stats.successCount + 1,
            lastLatency: latency,
            lastUpdatedAt: now,
            lastUpdatedSecondsAgo: 0,
            lastQuery: effectiveQuery,
          },
        }))

        lastQueryRef.current = effectiveQuery
      } catch (error) {
        console.error(error)
        const now = Date.now()

        setState((current) => ({
          ...current,
          loading: false,
          error,
          stats: {
            ...current.stats,
            errorCount: current.stats.errorCount + 1,
            lastLatency: error.latency ?? current.stats.lastLatency,
            lastUpdatedAt: now,
            lastUpdatedSecondsAgo: 0,
            lastQuery: effectiveQuery,
          },
        }))
      }
    },
    [chaosEnabled, query],
  )

  React.useEffect(() => {
    performFetch(query)
  }, [performFetch, query])

  const refetch = React.useCallback(() => {
    performFetch()
  }, [performFetch])

  return {
    products: state.products,
    loading: state.loading,
    error: state.error,
    stats: {
      successCount: state.stats.successCount,
      errorCount: state.stats.errorCount,
      lastLatency: state.stats.lastLatency,
      lastUpdated: state.stats.lastUpdatedSecondsAgo,
      lastQuery: state.stats.lastQuery,
    },
    refetch,
  }
}

