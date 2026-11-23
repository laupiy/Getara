import { useState } from 'react';
import { AlertTriangle, Brain, CheckCircle, ChevronDown, ChevronRight, FlaskConical, GitBranch, ListChecks, Table2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge, { NotTested } from '../components/ui/Badge';
import SegmentedControl from '../components/ui/SegmentedControl';
import KeyValue from '../components/ui/KeyValue';
import { AI_MODELS, EVAL_METRICS, EXPERIMENT_PROTOCOL, PIPELINE_STEPS, PIPELINE_TAIL } from '../content/aiModels';
import { fmt } from '../utils/format';

function PipelineNode({ title, desc, highlight = false }) {
  return (
    <div
      className={`min-w-[140px] flex-1 rounded-lg border px-3 py-2.5 ${
        highlight ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-navy-600 bg-navy-850'
      }`}
    >
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
    </div>
  );
}

function Arrow() {
  return (
    <>
      <ChevronRight size={18} className="hidden shrink-0 text-cyan-400/60 lg:block" />
      <ChevronDown size={18} className="mx-auto shrink-0 text-cyan-400/60 lg:hidden" />
    </>
  );
}

function PipelineDiagram({ selected, onSelect }) {
  return (
    <div className="panel-grid rounded-lg p-3">
      {/* Baris 1: data sensor → fitur */}
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        {PIPELINE_STEPS.map((s, i) => (
          <div key={s.id} className="contents">
            <PipelineNode title={s.title} desc={s.desc} />
            {i < PIPELINE_STEPS.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 py-2 text-[11px] text-cyan-300/70">
        <ChevronDown size={18} className="shrink-0 text-cyan-400/60" />
        fitur / sekuens yang sama dikirim ke ketiga model
      </div>
      {/* Baris 2: model → output */}
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                selected === m.id
                  ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                  : 'border-navy-600 bg-navy-850 text-slate-300 hover:border-cyan-400/30'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
        {PIPELINE_TAIL.map((s) => (
          <div key={s.id} className="contents">
            <Arrow />
            <PipelineNode title={s.title} desc={s.desc} highlight={s.id === 'out'} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Klik salah satu model pada diagram untuk melihat detailnya.</p>
    </div>
  );
}

function ModelDetail({ model }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={model.tone}>{model.category}</Badge>
          <Badge tone="amber" dot>
            {model.status}
          </Badge>
        </div>
        <p className="text-sm text-slate-300">{model.summary}</p>
        <div className="mt-4">
          <KeyValue
            mono={false}
            items={[
              ['Library', model.library],
              ['Input', model.input],
              ['Output', model.output],
            ]}
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Cara kerja (rancangan)</p>
        <ol className="space-y-2">
          {model.steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-[11px] text-cyan-300">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-emerald-300">Potensi kelebihan</p>
            <ul className="space-y-1">
              {model.strengths.map((s) => (
                <li key={s} className="flex gap-2 text-xs text-slate-400">
                  <CheckCircle size={13} className="mt-0.5 shrink-0 text-emerald-400/70" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-amber-300">Risiko / keterbatasan</p>
            <ul className="space-y-1">
              {model.risks.map((s) => (
                <li key={s} className="flex gap-2 text-xs text-slate-400">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400/70" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const COMPARISON_ROWS = [
  ['Jenis pendekatan', 'Ensemble pohon (unsupervised)', 'Reservoir rekuren acak', 'Reservoir jarang + adaptasi'],
  ['Memproses urutan waktu', 'Tidak (per window)', 'Ya', 'Ya'],
  ['Baseline adaptif', 'Tidak', 'Tidak', 'Ya (dengan gating)'],
  ['Data latih', 'Data normal', 'Data normal', 'Data normal'],
  ['Komponen yang dilatih', 'Seluruh pohon', 'Readout saja', 'Readout saja'],
  ['Status', 'Belum diimplementasikan', 'Belum diimplementasikan', 'Belum diimplementasikan'],
];

export default function AIAnalysis() {
  const { evaluation } = useApp();
  const [selected, setSelected] = useState('drosophila_esn');
  const model = AI_MODELS.find((m) => m.id === selected);

  const renderMetric = (modelId, key) => {
    const v = evaluation?.[modelId]?.[key];
    if (v === null || v === undefined) return <NotTested />;
    return <span className="font-mono text-slate-100">{key === 'detectionLatencyMs' ? `${fmt(v, 0)} ms` : fmt(v, 3)}</span>;
  };

  return (
    <>
      <PageHeader
        title="AI Analysis"
        description="Rancangan perbandingan tiga pendekatan deteksi anomali. Belum ada model yang dilatih atau diuji."
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/5 p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
        <div className="text-sm text-amber-100/90">
          <p className="font-semibold">Status: rancangan, belum ada hasil eksperimen.</p>
          <p className="mt-1 text-amber-100/70">
            Semua metrik ditandai <span className="font-mono">Not Tested</span>. Angka akan muncul otomatis setelah hasil
            evaluasi asli tersedia melalui lapisan data (<span className="font-mono">fetchEvaluationResults</span>).
          </p>
        </div>
      </div>

      <Card className="mb-6" title="Diagram Alur Pemrosesan" subtitle="Rencana pipeline dari sensor hingga dashboard" icon={GitBranch}>
        <PipelineDiagram selected={selected} onSelect={setSelected} />
      </Card>

      <Card
        className="mb-6"
        title="Penjelasan Pendekatan"
        icon={Brain}
        actions={
          <SegmentedControl
            size="sm"
            value={selected}
            onChange={setSelected}
            options={AI_MODELS.map((m) => ({ value: m.id, label: m.name }))}
          />
        }
      >
        <ModelDetail model={model} />
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Perbandingan Karakteristik" icon={Table2} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Aspek</th>
                  {AI_MODELS.map((m) => (
                    <th key={m.id} className="px-4 py-3 font-medium">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/60">
                {COMPARISON_ROWS.map(([aspect, ...vals]) => (
                  <tr key={aspect}>
                    <td className="px-5 py-2.5 text-slate-400">{aspect}</td>
                    {vals.map((v, i) => (
                      <td key={AI_MODELS[i].id} className="px-4 py-2.5 text-slate-200">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Evaluasi Model" subtitle="Diisi setelah eksperimen pada dataset asli" icon={FlaskConical} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Metrik</th>
                  {AI_MODELS.map((m) => (
                    <th key={m.id} className="px-4 py-3 font-medium">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/60">
                {EVAL_METRICS.map((metric) => (
                  <tr key={metric.key}>
                    <td className="px-5 py-2.5">
                      <p className="text-slate-200">{metric.label}</p>
                      <p className="text-xs text-slate-500">{metric.desc}</p>
                    </td>
                    {AI_MODELS.map((m) => (
                      <td key={m.id} className="px-4 py-2.5">
                        {renderMetric(m.id, metric.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="mt-6" title="Rencana Protokol Eksperimen" icon={ListChecks}>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {EXPERIMENT_PROTOCOL.map((p, i) => (
            <li key={p} className="flex gap-3 rounded-lg border border-navy-700 bg-navy-850 p-3 text-sm text-slate-300">
              <span className="font-mono text-xs text-cyan-300">{String(i + 1).padStart(2, '0')}</span>
              {p}
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
