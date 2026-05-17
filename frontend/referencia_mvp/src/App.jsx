import React, { useEffect, useMemo, useState } from 'react';
import defaultTemplate from './data/default-template.yaml?raw';
import { SENSOR_CATALOG } from './lib/sensorCatalog.js';
import { detectSensors, detectTags } from './lib/sensorDetector.js';
import { generateYaml } from './lib/yamlGenerator.js';
import { generateEnv } from './lib/envGenerator.js';
import { validateConfig, validateUploadedYaml } from './lib/validator.js';
import { buildLineDiffHtml } from './lib/diffEngine.js';

const CATEGORIES = ['all', 'messaging', 'database', 'web', 'system', 'cloud', 'observability', 'automation', 'other'];
const POLL_RATES = ['1s', '5s', '10s', '30s', '60s'];

const initialTags = [
  { key: 'client', value: '', locked: true },
  { key: 'environment', value: '', locked: true },
  { key: 'zone', value: '', locked: true },
  { key: 'owner', value: '', locked: true }
];

function createDefaultHostSensor() {
  return { id: 'required-host', type: 'host', config: { enabled: true }, required: true };
}

function newId() {
  return crypto?.randomUUID?.() || `id-${Math.random().toString(36).slice(2)}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function downloadText(filename, text, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function mergeImportedTags(currentTags, importedTags) {
  const byKey = new Map(currentTags.map(tag => [tag.key, tag]));
  importedTags.forEach(tag => {
    if (!tag.key) return;
    byKey.set(tag.key, { ...(byKey.get(tag.key) || tag), value: tag.value, locked: ['client', 'environment', 'zone', 'owner'].includes(tag.key) });
  });
  const required = ['client', 'environment', 'zone', 'owner'];
  required.forEach(key => {
    if (!byKey.has(key)) byKey.set(key, { key, value: '', locked: true });
  });
  return Array.from(byKey.values());
}

export default function App() {
  const [catalog, setCatalog] = useState(SENSOR_CATALOG);
  const [sourceName, setSourceName] = useState('Default Instana template v2026.05');
  const [sourceType, setSourceType] = useState('Default');
  const [sourceYaml, setSourceYaml] = useState(defaultTemplate);
  const [templateVersion, setTemplateVersion] = useState('v2026.05');
  const [workspaceMode, setWorkspaceMode] = useState('build');
  const [detectedSensors, setDetectedSensors] = useState(Object.keys(SENSOR_CATALOG));
  const [activeSensors, setActiveSensors] = useState([createDefaultHostSensor()]);
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [outputTab, setOutputTab] = useState('yaml');
  const [compareYaml, setCompareYaml] = useState('');
  const [compareName, setCompareName] = useState('Upload YAML to compare');
  const [tags, setTags] = useState(initialTags);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [bobNotes, setBobNotes] = useState([]);

  useEffect(() => {
    loadSource(defaultTemplate, 'Default Instana template v2026.05', 'Default', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yamlOutput = useMemo(() => generateYaml({ sourceName, templateVersion, tags, activeSensors, catalog }), [sourceName, templateVersion, tags, activeSensors, catalog]);
  const envOutput = useMemo(() => generateEnv(activeSensors, catalog), [activeSensors, catalog]);
  const issues = useMemo(() => validateConfig({ tags, activeSensors, catalog }), [tags, activeSensors, catalog]);
  const visibleIssues = issues.filter(item => item.type !== 'ok');
  const blockingIssues = issues.filter(item => item.type === 'error' || item.type === 'security');
  const selectedSensor = activeSensors.find(sensor => sensor.id === selectedSensorId) || null;
  const sortedActiveSensors = useMemo(() => {
    return [...activeSensors].sort((left, right) => {
      if (left.required !== right.required) return left.required ? -1 : 1;
      const leftMissing = missingCount(left);
      const rightMissing = missingCount(right);
      if (Boolean(leftMissing) !== Boolean(rightMissing)) return leftMissing ? -1 : 1;
      if (leftMissing !== rightMissing) return rightMissing - leftMissing;
      const leftLabel = catalog[left.type]?.label || left.type;
      const rightLabel = catalog[right.type]?.label || right.type;
      return leftLabel.localeCompare(rightLabel);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSensors, catalog]);

  const visibleSensors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return detectedSensors.filter(type => {
      const sensor = catalog[type];
      if (!sensor) return false;
      const matchesQuery = !query || sensor.label.toLowerCase().includes(query) || sensor.yamlKey.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || sensor.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [detectedSensors, catalog, search, category]);

  const compareIssues = useMemo(() => validateUploadedYaml(compareYaml), [compareYaml]);
  const diffHtml = useMemo(() => buildLineDiffHtml(yamlOutput, compareYaml, escapeHtml), [yamlOutput, compareYaml]);

  function loadSource(text, name, type, resetSensors = true) {
    const result = detectSensors(text);
    const importedTags = detectTags(text);
    setCatalog(result.catalog);
    setDetectedSensors(result.detectedSensors);
    setSourceYaml(text);
    setSourceName(name);
    setSourceType(type);
    if (importedTags.length) {
      setTags(current => mergeImportedTags(current, importedTags));
    }
    if (resetSensors) {
      setActiveSensors([createDefaultHostSensor()]);
      setSelectedSensorId('required-host');
    }
  }

  function handleDefaultTemplate() {
    const name = `Default Instana template ${templateVersion}`;
    loadSource(defaultTemplate, name, 'Default');
  }

  function handleTemplateVersion(value) {
    setTemplateVersion(value);
    if (sourceType === 'Default') setSourceName(`Default Instana template ${value}`);
  }

  function handleUploadSource(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadSource(String(reader.result || ''), file.name, 'Uploaded');
    reader.readAsText(file);
    event.target.value = '';
  }

  function handleCompareUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCompareYaml(String(reader.result || ''));
      setCompareName(file.name);
      setWorkspaceMode('compare');
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function updateTag(key, value) {
    setTags(current => current.map(tag => tag.key === key ? { ...tag, value } : tag));
  }

  function addTag() {
    setTags(current => [...current, { key: '', value: '', locked: false }]);
  }

  function updateCustomTag(index, field, value) {
    setTags(current => {
      const custom = current.filter(tag => !tag.locked);
      const target = custom[index];
      return current.map(tag => tag === target ? { ...tag, [field]: value } : tag);
    });
  }

  function removeCustomTag(index) {
    setTags(current => {
      const custom = current.filter(tag => !tag.locked);
      const target = custom[index];
      return current.filter(tag => tag !== target);
    });
  }

  function loadDemoValues() {
    const demoTags = {
      client: 'IBM',
      environment: 'PROD',
      zone: 'PAYMENTS',
      owner: 'MONITORING'
    };

    const demoSensors = ['generic-hardware', 'ibmmq']
      .filter(type => catalog[type])
      .map(type => {
        const defaults = catalog[type]?.defaults || { enabled: true };
        const config = { ...defaults };
        if (type === 'generic-hardware') {
          config['availability-zone'] = 'Datacenter A / Rack 42';
        }
        if (type === 'ibmmq') {
          Object.assign(config, {
            queueManagerName: 'QM.PAYMENTS.01',
            host: 'mq-payments.ibm.internal',
            port: '1414',
            channel: 'PAYMENTS.SVRCONN',
            username: '${IBMMQ_USERNAME}',
            password: '${IBMMQ_PASSWORD}',
            tls_enabled: true
          });
        }
        return { id: `demo-${type}`, type, config };
      });

    setTags(current => current.map(tag => tag.locked && demoTags[tag.key] ? { ...tag, value: demoTags[tag.key] } : tag));
    setActiveSensors([createDefaultHostSensor(), ...demoSensors]);
    setSelectedSensorId(demoSensors[1]?.id || demoSensors[0]?.id || 'required-host');
    setSearch('');
    setCategory('all');
    setWorkspaceMode('build');
  }

  function enableOrSelectSensor(type) {
    const existing = activeSensors.find(sensor => sensor.type === type);
    if (existing) {
      if (!existing.required) removeSensor(existing.id);
      return;
    }
    const meta = catalog[type];
    const sensor = { id: newId(), type, config: { ...(meta?.defaults || { enabled: true }) } };
    setActiveSensors(current => [...current, sensor]);
    setSelectedSensorId(sensor.id);
  }

  function enableVisibleSensors() {
    const currentTypes = new Set(activeSensors.map(sensor => sensor.type));
    const newSensors = visibleSensors
      .filter(type => !currentTypes.has(type))
      .map(type => ({ id: newId(), type, config: { ...(catalog[type]?.defaults || { enabled: true }) } }));
    if (!newSensors.length) return;
    setActiveSensors(current => [...current, ...newSensors]);
    setSelectedSensorId(previous => previous || newSensors[0].id);
  }

  function updateSensorConfig(id, key, value) {
    setActiveSensors(current => current.map(sensor => sensor.id === id ? { ...sensor, config: { ...sensor.config, [key]: value } } : sensor));
  }

  function removeSensor(id) {
    if (id === 'required-host') return;
    setActiveSensors(current => {
      const next = current.filter(sensor => sensor.id !== id);
      if (selectedSensorId === id) setSelectedSensorId(next[0]?.id || null);
      return next;
    });
  }

  function missingRequiredFields(sensor) {
    const required = catalog[sensor.type]?.requiredFields || [];
    return required.filter(key => !String(sensor.config?.[key] || '').trim());
  }

  function missingCount(sensor) {
    return missingRequiredFields(sensor).length;
  }

  function countEnvVars() {
    const vars = new Set();
    activeSensors.forEach(sensor => (catalog[sensor.type]?.env || []).forEach(v => vars.add(v)));
    return vars.size;
  }

  function issueColor(type) {
    if (type === 'ok') return 'var(--green)';
    if (type === 'warning') return 'var(--yellow)';
    if (type === 'security') return '#ff9f40';
    return 'var(--red)';
  }

  function currentOutput() {
    if (outputTab === 'env') return envOutput;
    if (outputTab === 'bob') return bobNotes.join('\n');
    return yamlOutput;
  }

  function downloadCurrentOutput() {
    if (outputTab === 'env') downloadText('.env.example', envOutput, 'text/plain;charset=utf-8');
    else if (outputTab === 'bob') downloadText('bob-notes.md', bobNotes.join('\n'), 'text/markdown;charset=utf-8');
    else downloadText('configuration.yaml', yamlOutput, 'text/yaml;charset=utf-8');
  }

  function runBobAnalysis() {
    setBobNotes([
      'Use Bob IDE to implement YAML parsing as a dedicated module.',
      'Use Bob IDE code review to verify secret handling and validation rules.',
      'Export Bob task histories into bob_sessions for the final repository.',
      'Bob can help generate tests for sensor rendering, env generation and audit rules.'
    ]);
    setOutputTab('bob');
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand-block">
          <div className="logo">IC</div>
          <div>
            <div className="app-title">Instana ConfigPilot</div>
            <div className="app-subtitle">Build Instana configuration.yaml from an official template, selected sensors and editable tags</div>
          </div>
        </div>
        <div className="top-note">Hackathon preview - YAML source to sensors to generated files</div>
      </header>

      <input id="yamlUpload" type="file" accept=".yaml,.yml,text/plain" hidden onChange={handleUploadSource} />
      <input id="diffUploadB" type="file" accept=".yaml,.yml,text/plain" hidden onChange={handleCompareUpload} />

      <main className="layout">
        <aside className="panel">
          <PanelHead label="Start here" title="Template & Tags" />
          <div className="panel-body scroll-y space-y-3">
            <div className="box source-step">
              <div className="step-num">1</div>
              <div>
                <div className="title text-sm">Choose the YAML source</div>
                <div className="hint mt-1">This is the Instana base file used to discover available sensor blocks.</div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button className="btn btn-primary" onClick={handleDefaultTemplate}>Default</button>
                  <button className="btn" onClick={() => document.getElementById('yamlUpload').click()}>Upload</button>
                </div>
              </div>
            </div>

            <div className="box">
              <div className="label">Current source</div>
              <div className="font-bold text-sm truncate mt-1">{sourceName}</div>
              <div className="hint mt-1">{sourceType} - {detectedSensors.length} sensor blocks found</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`source-badge ${sourceType === 'Default' ? 'trusted' : ''}`}>{sourceType === 'Default' ? 'Official template parsed' : 'Uploaded YAML parsed'}</span>
                <button className="btn demo-btn" onClick={loadDemoValues}>Load demo values</button>
              </div>
              <div className="mt-3">
                <select className="field" value={templateVersion} onChange={e => handleTemplateVersion(e.target.value)}>
                  <option value="v2026.05">v2026.05</option>
                  <option value="v1.2.5">v1.2.5</option>
                  <option value="v1.1.0">v1.1.0</option>
                </select>
              </div>
            </div>

            <div className="box source-step">
              <div className="step-num">2</div>
              <div>
                <div className="title text-sm">Define agent tags</div>
                <div className="hint mt-1">These tags are written to the host section. Add more tags if your company needs them.</div>
              </div>
            </div>

            <div className="box space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <TagInput label="client" value={getTagValue(tags, 'client')} onChange={v => updateTag('client', v)} placeholder="ibm" />
                <TagInput label="environment" value={getTagValue(tags, 'environment')} onChange={v => updateTag('environment', v)} placeholder="production" />
                <TagInput label="zone" value={getTagValue(tags, 'zone')} onChange={v => updateTag('zone', v)} placeholder="payments" />
                <TagInput label="owner" value={getTagValue(tags, 'owner')} onChange={v => updateTag('owner', v)} placeholder="middleware" />
              </div>
            </div>

            <div className="box space-y-2">
              <div className="flex items-center justify-between">
                <div><div className="title text-sm">Additional tags</div><div className="hint">Optional key/value tags</div></div>
                <button className="btn" onClick={addTag}>Add tag</button>
              </div>
              <div className="space-y-2">
                {tags.filter(t => !t.locked).length === 0 && <div className="hint">No additional tags yet.</div>}
                {tags.filter(t => !t.locked).map((tag, index) => (
                  <div className="tag-row" key={index}>
                    <input className="field" value={tag.key} placeholder="tag key" onChange={e => updateCustomTag(index, 'key', e.target.value)} />
                    <input className="field" value={tag.value} placeholder="tag value" onChange={e => updateCustomTag(index, 'value', e.target.value)} />
                    <button className="btn btn-red icon-btn" onClick={() => removeCustomTag(index)} aria-label="Remove tag">x</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="box source-step">
              <div className="step-num">3</div>
              <div><div className="title text-sm">Select and configure sensors</div><div className="hint mt-1">Use the center panel. Search, enable and configure only the sensor blocks you need.</div></div>
            </div>
          </div>
        </aside>

        <section className="panel">
          <div className="panel-head">
            <div><div className="label">Build here</div><div className="title">Sensor Catalog & Configuration</div></div>
            <div className="segmented">
              <button className={`seg-btn ${workspaceMode === 'build' ? 'active' : ''}`} onClick={() => setWorkspaceMode('build')}>Build</button>
              <button className={`seg-btn ${workspaceMode === 'compare' ? 'active' : ''}`} onClick={() => setWorkspaceMode('compare')}>Compare</button>
            </div>
          </div>
          <div className="panel-body min-h-0">
            <div className={`grid grid-rows-[82px_minmax(230px,1fr)_245px] gap-3 h-full ${workspaceMode !== 'build' ? 'hidden-panel' : ''}`}>
              <div className="grid grid-cols-4 gap-3">
                <Metric label="Sensors parsed" value={detectedSensors.length} detail={search || category !== 'all' ? `${visibleSensors.length} visible` : 'from source YAML'} />
                <Metric label="Enabled in output" value={activeSensors.length} />
                <Metric label="Blocking issues" value={blockingIssues.length} valueClass="text-red-300" />
                <Metric label="Generated env vars" value={countEnvVars()} valueClass="text-blue-300" />
              </div>

              <div className="grid grid-cols-[minmax(340px,.95fr)_minmax(380px,1.05fr)] gap-3 min-h-0">
                <div className="box p-0 min-h-0 flex flex-col">
                  <div className="px-3 py-2 border-b border-white/10 grid grid-cols-[1fr_130px] gap-2 items-center">
                    <div><div className="title text-sm">Available sensors from template</div><div className="hint">Official sensor blocks discovered from the YAML source</div></div>
                    <button className="btn btn-green" onClick={enableVisibleSensors}>Enable visible</button>
                  </div>
                  <div className="px-3 py-2 border-b border-white/10 grid grid-cols-[1fr_145px] gap-2">
                    <input className="field" placeholder="Search sensor or YAML key..." value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="field" value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(item => <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>)}</select>
                  </div>
                  <div className="scroll-y flex-1 sensor-list-scroll">
                    {visibleSensors.map(type => <SensorCatalogRow key={type} type={type} catalog={catalog} enabled={activeSensors.some(s => s.type === type)} selected={activeSensors.some(s => s.type === type && s.id === selectedSensorId)} onClick={() => enableOrSelectSensor(type)} />)}
                    {!visibleSensors.length && <EmptyState title="No sensors found" detail="Try another search term or switch to All categories." />}
                  </div>
                </div>

                <div className="box p-0 min-h-0 flex flex-col">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <div><div className="title text-sm">Enabled sensors in generated YAML</div><div className="hint">Blocks that will be written to configuration.yaml</div></div>
                    <button className="btn btn-red" onClick={() => { setActiveSensors([createDefaultHostSensor()]); setSelectedSensorId('required-host'); }}>Clear</button>
                  </div>
                  <div className="scroll-y flex-1">
                    {sortedActiveSensors.map(sensor => <EnabledSensorRow key={sensor.id} sensor={sensor} catalog={catalog} selected={sensor.id === selectedSensorId} missing={missingCount(sensor)} onSelect={() => setSelectedSensorId(sensor.id)} onRemove={() => removeSensor(sensor.id)} />)}
                    {!activeSensors.length && <EmptyState title="No sensors selected" detail="Pick a sensor from the left catalog. The YAML output updates immediately." />}
                  </div>
                </div>
              </div>

              <div className="box min-h-0 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div><div className="title text-sm">Sensor configuration</div><div className="hint">{selectedSensor ? `${catalog[selectedSensor.type]?.yamlKey} - fields generated from the official sensor definition` : 'Select a sensor from the lists above to edit its values.'}</div></div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white/10 text-slate-300">{selectedSensor ? catalog[selectedSensor.type]?.label : 'None selected'}</span>
                </div>
                <div className="scroll-y flex-1">
                  {selectedSensor ? <SensorEditor sensor={selectedSensor} catalog={catalog} onChange={updateSensorConfig} /> : <EmptyState title="No sensor selected" detail="Select a sensor to review its generated fields." />}
                </div>
              </div>
            </div>

            <div className={`grid grid-rows-[auto_1fr] gap-3 h-full ${workspaceMode !== 'compare' ? 'hidden-panel' : ''}`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="box"><div className="title text-sm">File A</div><div className="hint mt-1">Current generated YAML</div><button className="btn mt-3" onClick={() => setWorkspaceMode('compare')}>Use generated YAML</button></div>
                <div className="box"><div className="title text-sm">File B</div><div className="hint mt-1">{compareName}</div><button className="btn mt-3" onClick={() => document.getElementById('diffUploadB').click()}>Upload compare YAML</button></div>
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-3 min-h-0">
                <div className="box p-0 flex flex-col min-h-0"><div className="px-3 py-2 border-b border-white/10"><div className="title text-sm">Differences</div><div className="hint">What exists in one file and differs from the other</div></div><div className="output-code rounded-none border-0" dangerouslySetInnerHTML={{ __html: diffHtml }} /></div>
                <div className="box p-0 flex flex-col min-h-0"><div className="px-3 py-2 border-b border-white/10"><div className="title text-sm">Compare validation</div><div className="hint">Syntax and risk findings for comparison workflow</div></div><div className="scroll-y p-3 space-y-2">{compareIssues.map((item, index) => <AuditRow key={index} item={item} color={issueColor(item.type)} />)}</div></div>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head"><div><div className="label">Result</div><div className="title">Output preview</div></div><HealthBadge issues={issues} /></div>
          <div className="panel-body flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap gap-2"><button className={`tab ${outputTab === 'yaml' ? 'active' : ''}`} onClick={() => setOutputTab('yaml')}>configuration.yaml</button><button className={`tab ${outputTab === 'env' ? 'active' : ''}`} onClick={() => setOutputTab('env')}>.env.example</button><button className={`tab ${outputTab === 'bob' ? 'active' : ''}`} onClick={() => setOutputTab('bob')}>Bob notes</button></div>
              <div className="flex gap-2"><button className="btn" onClick={() => navigator.clipboard.writeText(currentOutput())}>Copy</button><button className="btn btn-primary" onClick={downloadCurrentOutput}>Download</button></div>
            </div>
            <OutputPanel tab={outputTab} yaml={yamlOutput} env={envOutput} bobNotes={bobNotes} onRunBob={runBobAnalysis} />
            <div className="audit-strip"><div className="flex items-center justify-between mb-2"><div><div className="title text-sm">Validation findings</div><div className="hint">Required fields and security warnings</div></div><span className="text-xs rounded-full bg-white/10 px-2 py-1 text-slate-300">{visibleIssues.length} finding(s)</span></div><div className="scroll-y space-y-2 flex-1 pr-1">{visibleIssues.length ? visibleIssues.map((item, index) => <AuditRow key={index} item={item} color={issueColor(item.type)} />) : <EmptyState title="Ready to export" detail="No blocking findings detected." compact />}</div></div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function getTagValue(tags, key) {
  return tags.find(tag => tag.key === key)?.value || '';
}

function PanelHead({ label, title }) {
  return <div className="panel-head"><div><div className="label">{label}</div><div className="title">{title}</div></div></div>;
}

function TagInput({ label, value, onChange, placeholder }) {
  return <label><div className="hint mb-1">{label}</div><input className="field" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>;
}

function Metric({ label, value, valueClass = '', detail }) {
  return <div className="metric"><div className="hint">{label}</div><div className={`text-3xl font-black mt-1 ${valueClass}`}>{value}</div>{detail && <div className="metric-detail">{detail}</div>}</div>;
}

function EmptyState({ title, detail, compact = false }) {
  return <div className={`empty-state ${compact ? 'compact' : ''}`}><div className="font-black text-white mb-1">{title}</div><div className="hint">{detail}</div></div>;
}

function SensorCatalogRow({ type, catalog, enabled, selected, onClick }) {
  const sensor = catalog[type];
  const isDefaultSensor = type === 'host';
  const actionLabel = isDefaultSensor && enabled ? 'Default' : enabled ? 'On' : 'Add';
  return <div className={`catalog-row catalog-available ${selected ? 'selected' : ''}`} onClick={onClick}><div><span className={`status-pill ${isDefaultSensor && enabled ? 'state-default' : enabled ? 'btn-green' : ''}`}>{actionLabel}</span></div><div><div className="font-bold truncate">{sensor.label}</div><div className="hint truncate">{sensor.yamlKey}</div></div><div className="hint truncate">{sensor.category}</div><div className="hint text-right">{sensor.env.length ? `${sensor.env.length} env` : 'no env'}</div></div>;
}

function EnabledSensorRow({ sensor, catalog, selected, missing, onSelect, onRemove }) {
  const meta = catalog[sensor.type];
  const state = sensor.required
    ? <span className="state-badge state-default">Default</span>
    : missing
      ? <span className="state-badge state-missing">Missing {missing}</span>
      : <span className="state-badge state-ready">Ready</span>;
  return <div className={`catalog-row catalog-enabled ${selected ? 'selected' : ''} ${missing ? 'row-missing' : ''}`} onClick={onSelect}><div><span className="status-pill">{sensor.required ? 'Required' : 'Edit'}</span></div><div><div className="font-bold truncate">{meta.label}</div><div className="hint truncate">Written to YAML</div></div><div>{state}</div><div className="text-right">{sensor.required ? <span className="hint">Locked</span> : <button className="btn btn-red icon-btn" onClick={event => { event.stopPropagation(); onRemove(); }} aria-label={`Remove ${meta.label}`}>x</button>}</div></div>;
}

function SensorEditor({ sensor, catalog, onChange }) {
  const meta = catalog[sensor.type];
  const requiredFields = new Set(meta.requiredFields || []);
  return <div className="editor-grid">{meta.fields.map(([key, label, type]) => <EditorField key={key} sensor={sensor} fieldKey={key} label={label} type={type} required={requiredFields.has(key)} onChange={onChange} />)}</div>;
}

function RequiredLabel({ label, required, missing }) {
  return <div className={`hint mb-1 field-label ${required ? 'required-label' : ''} ${missing ? 'missing' : ''}`} title={required ? 'Required by this sensor definition' : undefined}>{label}{required && <><span> *</span><span className="required-chip">Required</span></>}</div>;
}

function EditorField({ sensor, fieldKey, label, type, required, onChange }) {
  const value = sensor.config[fieldKey];
  const missing = required && !String(value || '').trim();
  const fieldClass = `field ${required ? 'field-required' : ''} ${missing ? 'field-required-missing' : ''}`;
  if (type === 'checkbox') {
    return <label><RequiredLabel label={label} required={required} missing={missing} /><select className={fieldClass} value={value ? 'true' : 'false'} onChange={e => onChange(sensor.id, fieldKey, e.target.value === 'true')}><option value="true">Enabled</option><option value="false">Disabled</option></select></label>;
  }
  if (type === 'select') {
    return <label><RequiredLabel label={label} required={required} missing={missing} /><select className={fieldClass} value={value} onChange={e => onChange(sensor.id, fieldKey, e.target.value)}>{POLL_RATES.map(rate => <option key={rate}>{rate}</option>)}</select></label>;
  }
  return <label><RequiredLabel label={label} required={required} missing={missing} /><input className={fieldClass} value={value || ''} onChange={e => onChange(sensor.id, fieldKey, e.target.value)} /></label>;
}

function HealthBadge({ issues }) {
  if (issues.some(item => item.type === 'error' || item.type === 'security')) return <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-200">Needs input</span>;
  if (issues.some(item => item.type === 'warning')) return <span className="px-3 py-1 rounded-full text-xs font-black bg-yellow-500/20 text-yellow-200">Warning</span>;
  return <span className="px-3 py-1 rounded-full text-xs font-black bg-green-500/20 text-green-200">Ready</span>;
}

function OutputPanel({ tab, yaml, env, bobNotes, onRunBob }) {
  if (tab === 'env') return <><div className="flex items-center justify-between mb-3"><div><div className="title text-sm">.env.example</div><div className="hint">Generated environment placeholders</div></div></div><pre className="output-code">{env}</pre></>;
  if (tab === 'bob') return <><div className="box mb-3"><div className="title text-sm">IBM Bob usage notes</div><div className="hint mt-1">For the hackathon story, Bob IDE supports implementation, review, testing and documentation. Exported sessions go into bob_sessions.</div></div><button className="btn btn-primary w-full mb-3" onClick={onRunBob}>Generate Bob notes</button><div className="scroll-y space-y-2 flex-1">{(bobNotes.length ? bobNotes : ['Run analysis to generate implementation notes for Bob IDE, SRE validation and migration logic.']).map((note, index) => <div className="audit-row" key={index}><span className="dot" style={{ background: 'var(--cyan)' }} /><div>{note}</div></div>)}</div></>;
  return <><div className="flex items-center justify-between mb-3"><div><div className="title text-sm">configuration.yaml</div><div className="hint">Generated from selected sensors and tags</div></div></div><pre className="output-code">{yaml}</pre></>;
}

function AuditRow({ item, color }) {
  return <div className="audit-row"><span className="dot" style={{ background: color }} /><div><div className="font-bold">{item.title}</div><div className="hint">{item.detail}</div></div></div>;
}
