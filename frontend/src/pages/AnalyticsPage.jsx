import { Activity, Brain, FileText, MessageSquare } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getAnalyticsApi } from '../api/documents'
import Layout from '../components/layout/Layout'
import StatCard from '../components/ui/StatCard'

const statusColors = {
  COMPLETED: '#34d399',
  PROCESSING: '#4f9cf9',
  PENDING: '#fbbf24',
  FAILED: '#f87171',
}

export default function AnalyticsPage() {
  const [data, setData] = useState({ documentsByStatus: {} })

  useEffect(() => {
    getAnalyticsApi().then(setData).catch(() => setData({ documentsByStatus: {} }))
  }, [])

  const queryData = useMemo(() => {
    if (!Array.isArray(data.queriesPerDay) || data.queriesPerDay.length === 0) return []
    return data.queriesPerDay.map((item, index) => ({
      date: item.date || item.label || `Day ${index + 1}`,
      queries: item.queries ?? item.count ?? item.value ?? 0,
    }))
  }, [data.queriesPerDay])

  const statusData = Object.entries(data.documentsByStatus || {})
    .filter(([, value]) => Number(value) > 0)
    .map(([name, value]) => ({ name, value: Number(value), fill: statusColors[name] || '#818cf8' }))

  return (
    <Layout title="Analytics">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-4xl font-bold text-white">Analytics</h2>
          <p className="mt-2 text-slate-400">Usage and indexing telemetry from your workspace.</p>
        </div>
        <span className="badge badge-blue">Last 7 days</span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Documents" value={data.totalDocuments || 0} tone="blue" />
        <StatCard icon={MessageSquare} label="Sessions" value={data.chatSessions || 0} tone="violet" delay={70} />
        <StatCard icon={Activity} label="Queries Today" value={data.queriesToday || 0} tone="emerald" delay={140} />
        <StatCard icon={Brain} label="Knowledge Base" value={data.knowledgeBaseSize || 0} tone="pink" delay={210} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="glass rounded-2xl p-6">
          <h3 className="font-display mb-5 text-xl font-bold text-white">Query Activity</h3>
          <div className="h-72">
            {queryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={queryData}>
                  <defs>
                    <linearGradient id="queryGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4f9cf9" stopOpacity={0.75} />
                      <stop offset="100%" stopColor="#4f9cf9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,.06)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#0f1734', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: '#f0f4ff' }} />
                  <Area type="monotone" dataKey="queries" stroke="#4f9cf9" strokeWidth={2} fill="url(#queryGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-center text-slate-400">
                <p>No query activity data available</p>
              </div>
            )}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h3 className="font-display mb-5 text-xl font-bold text-white">Document Status</h3>
          <div className="h-72">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                    {statusData.map((item) => <Cell key={item.name} fill={item.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f1734', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: '#f0f4ff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-center text-slate-400">
                <p>No document status data available</p>
              </div>
            )}
          </div>
          {statusData.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {statusData.map((item) => (
                <span key={item.name} className="badge" style={{ background: `${item.fill}22`, color: item.fill }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: item.fill }} />
                  {item.name}: {item.value}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
