import { useState } from 'react'
import { Activity, AlertTriangle, RefreshCw, Search, Skull } from 'lucide-react'
import { useMarketplaceData } from './hooks/useMarketplaceData'

function App() {
  const [query, setQuery] = useState('notebook')
  const [chaosEnabled, setChaosEnabled] = useState(false)

  const { products, loading, error, stats, refetch } = useMarketplaceData({
    query,
    chaosEnabled,
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const value = formData.get('query')?.toString().trim()
    if (value) {
      setQuery(value)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header de controle */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Marketplace Resilience Monitor
              </p>
              <p className="text-xs text-slate-500">
                Monitorando a saúde da integração com o Mercado Livre
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <form
              onSubmit={handleSubmit}
              className="flex max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <input
                name="query"
                defaultValue={query}
                className="h-8 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                placeholder="Buscar produto (ex: notebook, iPhone, teclado)..."
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Buscar</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => setChaosEnabled((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                chaosEnabled
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700'
              }`}
            >
              {chaosEnabled ? (
                <>
                  <Skull className="h-4 w-4" />
                  <span>Chaos Monkey ATIVO</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  <span>Ambiente Estável</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        {/* Painel de status */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Estado do Sistema
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  chaosEnabled
                    ? 'bg-rose-50 text-rose-700'
                    : error
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {chaosEnabled
                  ? 'Instabilidade Forçada (Chaos Monkey)'
                  : error
                    ? 'Degradação Parcial'
                    : 'Operacional'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {chaosEnabled
                ? 'Falhas são injetadas propositalmente para validar o comportamento de erro.'
                : 'Monitorando falhas reais de rede e API mantendo a experiência utilizável.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Última Observação
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {stats.lastQuery || '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {stats.lastUpdated
                ? `Atualizado há ${stats.lastUpdated} s`
                : 'Aguardando primeira busca.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Telemetria
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
              <div>
                <dt className="text-[11px] uppercase tracking-wide">
                  Sucessos
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-emerald-600">
                  {stats.successCount}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide">Falhas</dt>
                <dd className="mt-0.5 text-sm font-semibold text-rose-600">
                  {stats.errorCount}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide">
                  Último tempo
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                  {stats.lastLatency
                    ? `${stats.lastLatency.toFixed(0)} ms`
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Área de produtos / loading / erro */}
        <section className="mt-2 flex-1">
          {error ? (
            <ErrorState
              message={error.message}
              onRetry={refetch}
              chaosEnabled={chaosEnabled}
            />
          ) : (
            <ProductsGrid loading={loading} products={products} />
          )}
        </section>
      </main>
    </div>
  )
}

function ProductsGrid({ loading, products }) {
  if (loading) {
    return (
      <div
        aria-label="Carregando resultados"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
        <Search className="h-6 w-6 text-slate-400" />
        <p className="mt-2 text-sm font-semibold text-slate-800">
          Nenhum resultado encontrado.
        </p>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Ajuste o termo de busca ou desative o modo de instabilidade para
          validar o comportamento normal da aplicação.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {product.title}
        </h3>
        <p className="mt-1 line-clamp-3 text-xs text-slate-500">
          {product.description}
        </p>
        <p className="mt-2 text-lg font-bold text-emerald-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 2,
          }).format(product.price)}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500">
            ID: {product.id}
          </span>
        </div>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
        <div className="h-full w-full animate-pulse bg-slate-200" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </article>
  )
}

function ErrorState({ message, onRetry, chaosEnabled }) {
  return (
    <div className="flex min-h-[220px] flex-col justify-center rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-6 text-sm text-rose-900 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1.5">
          <h2 className="text-sm font-semibold">
            Falha ao consultar o Marketplace.
          </h2>
          <p className="text-xs text-rose-800/90">
            {message || 'Ocorreu um erro inesperado durante a comunicação.'}
          </p>
          <p className="text-xs text-rose-800/80">
            {chaosEnabled
              ? 'O modo Chaos Monkey está injetando falhas artificiais. Desative-o para verificar o comportamento em ambiente estável.'
              : 'A aplicação continua operacional. Você pode tentar novamente sem recarregar a página.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Tentar novamente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
