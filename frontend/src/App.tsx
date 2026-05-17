import React, { useEffect, useMemo, useState } from 'react';
import defaultTemplate from './data/default-template.yaml?raw';
import { SENSOR_CATALOG, SensorCatalog } from './lib/sensorCatalog';
import { detectSensors, detectTags, Tag } from './lib/sensorDetector';
import { generateYaml, ActiveSensor } from './lib/yamlGenerator';
import { generateEnv } from './lib/envGenerator';
import { validateConfig, validateUploadedYaml, ValidationIssue } from './lib/validator';
import { buildLineDiffHtml } from './lib/diffEngine';

const CATEGORIES = ['all', 'messaging', 'database', 'web', 'system', 'cloud', 'observability', 'automation', 'other'];
const POLL_RATES = ['1s', '5s', '10s', '30s', '60s'];

const initialTags: Tag[] = [
  { key: 'client', value: '', locked: true },
  { key: 'environment', value: '', locked: true },
  { key: 'zone', value: '', locked: true },
  { key: 'owner', value: '', locked: true }
];

function createDefaultHostSensor(): ActiveSensor {
  return { id: 'required-host', type: 'host', config: { enabled: true }, required: true };
}

function newId(): string {
  return crypto?.randomUUID?.() || `id-${Math.random().toString(36).slice(2)}`;
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function downloadText(filename: string, text: string, type = 'text/plain;charset=utf-8'): void {
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

function mergeImportedTags(currentTags: Tag[], importedTags: Tag[]): Tag[] {
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
  const [catalog, setCatalog] = useState<SensorCatalog>(SENSOR_CATALOG);
  const [sourceName, setSourceName] = useState('Default Instana template v2026.05');
  const [sourceType, setSourceType] = useState('Default');
  const [templateVersion, setTemplateVersion] = useState('v2026.05');
  const [workspaceMode, setWorkspaceMode] = useState<'build' | 'compare'>('build');
  const [detectedSensors, setDetectedSensors] = useState<string[]>(Object.keys(SENSOR_CATALOG));
  const [activeSensors, setActiveSensors] = useState<ActiveSensor[]>([createDefaultHostSensor()]);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<'yaml' | 'env' | 'bob'>('yaml');
  const [compareYaml, setCompareYaml] = useState('');
  const [compareName, setCompareName] = useState('Upload YAML to compare');
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [bobNotes, setBobNotes] = useState<string[]>([]);

  useEffect(() => {
    loadSource(defaultTemplate, 'Default Instana template v2026.05', 'Default', false);
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

  function loadSource(text: string, name: string, type: string, resetSensors = true) {
    const result = detectSensors(text);
    const importedTags = detectTags(text);
    setCatalog(result.catalog);
    setDetectedSensors(result.detectedSensors);
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

  function handleTemplateVersion(value: string) {
    setTemplateVersion(value);
    if (sourceType === 'Default') setSourceName(`Default Instana template ${value}`);
  }

  function handleUploadSource(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadSource(String(reader.result || ''), file.name, 'Uploaded');
    reader.readAsText(file);
    event.target.value = '';
  }

  function handleCompareUpload(event: React.ChangeEvent<HTMLInputElement>) {
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

  function updateTag(key: string, value: string) {
    setTags(current => current.map(tag => tag.key === key ? { ...tag, value } : tag));
  }

  function addTag() {
    setTags(current => [...current, { key: '', value: '', locked: false }]);
  }

  function updateCustomTag(index: number, field: 'key' | 'value', value: string) {
    setTags(current => {
      const custom = current.filter(tag => !tag.locked);
      const target = custom[index];
      return current.map(tag => tag === target ? { ...tag, [field]: value } : tag);
    });
  }

  function removeCustomTag(index: number) {
    setTags(current => {
      const custom = current.filter(tag => !tag.locked);
      const target = custom[index];
      return current.filter(tag => tag !== target);
    });
  }

  function loadDemoValues() {
    const demoTags: Record<string, string> = {
      client: 'IBM',
      environment: 'PROD',
      zone: 'PAYMENTS',
      owner: 'MONITORING'
    };

    const demoSensors = ['ibmmq']
      .filter(type => catalog[type])
      .map(type => {
        const defaults = catalog[type]?.defaults || { enabled: true };
        const config = { ...defaults };
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
    setSelectedSensorId(demoSensors[0]?.id || 'required-host');
    setSearch('');
    setCategory('all');
    setWorkspaceMode('build');
  }

  function enableOrSelectSensor(type: string) {
    const existing = activeSensors.find(sensor => sensor.type === type);
    if (existing) {
      if (!existing.required) removeSensor(existing.id);
      return;
    }
    const meta = catalog[type];
    const sensor: ActiveSensor = { id: newId(), type, config: { ...(meta?.defaults || { enabled: true }) } };
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

  function updateSensorConfig(id: string, key: string, value: any) {
    setActiveSensors(current => current.map(sensor => sensor.id === id ? { ...sensor, config: { ...sensor.config, [key]: value } } : sensor));
  }

  function removeSensor(id: string) {
    if (id === 'required-host') return;
    setActiveSensors(current => {
      const next = current.filter(sensor => sensor.id !== id);
      if (selectedSensorId === id) setSelectedSensorId(next[0]?.id || null);
      return next;
    });
  }

  function missingRequiredFields(sensor: ActiveSensor): string[] {
    const required = catalog[sensor.type]?.requiredFields || [];
    return required.filter(key => !String(sensor.config?.[key] || '').trim());
  }

  function missingCount(sensor: ActiveSensor): number {
    return missingRequiredFields(sensor).length;
  }

  function countEnvVars(): number {
    const vars = new Set<string>();
    activeSensors.forEach(sensor => (catalog[sensor.type]?.env || []).forEach(v => vars.add(v)));
    return vars.size;
  }

  function issueColor(type: ValidationIssue['type']): string {
    if (type === 'ok') return 'var(--green)';
    if (type === 'warning') return 'var(--yellow)';
    if (type === 'security') return '#ff9f40';
    return 'var(--red)';
  }

  function currentOutput(): string {
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
      'Architecture pivoted to 100% Frontend-Only (Serverless Client-Side)',
      'All YAML processing happens in the browser using pure TypeScript functions',
      'No backend API calls - zero latency, zero server costs',
      'Deploy as static files with Nginx - perfect for hackathon demo'
    ]);
    setOutputTab('bob');
  }

  const getTagValue = (key: string) => tags.find(t => t.key === key)?.value || '';

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
          <div className="panel-head"><div><div className="label">Start here</div><div className="title">Template & Tags</div></div></div>
          <div className="panel-body scroll-y space-y-3">
            <div className="box source-step">
              <div className="step-num">1</div>
              <div>
                <div className="title text-sm">Choose the YAML source</div>
                <div className="hint mt-1">This is the Instana base file used to discover available sensor blocks.</div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button className="btn btn-primary" onClick={handleDefaultTemplate}>Default</button>
                  <button className="btn" onClick={() => document.getElementById('yamlUpload')?.click()}>Upload</button>
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
                <label><div className="hint mb-1">client</div><input className="field" value={getTagValue('client')} placeholder="ibm" onChange={e => updateTag('client', e.target.value)} /></label>
                <label><div className="hint mb-1">environment</div><input className="field" value={getTagValue('environment')} placeholder="production" onChange={e => updateTag('environment', e.target.value)} /></label>
                <label><div className="hint mb-1">zone</div><input className="field" value={getTagValue('zone')} placeholder="payments" onChange={e => updateTag('zone', e.target.value)} /></label>
                <label><div className="hint mb-1">owner</div><input className="field" value={getTagValue('owner')} placeholder="middleware" onChange={e => updateTag('owner', e.target.value)} /></label>
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
                <div className="metric"><div className="hint">Sensors parsed</div><div className="text-3xl font-black mt-1">{detectedSensors.length}</div>{(search || category !== 'all') && <div className="metric-detail">{visibleSensors.length} visible</div>}</div>
                <div className="metric"><div className="hint">Enabled in output</div><div className="text-3xl font-black mt-1">{activeSensors.length}</div></div>
                <div className="metric"><div className="hint">Blocking issues</div><div className="text-3xl font-black mt-1 text-red-300">{blockingIssues.length}</div></div>
                <div className="metric"><div className="hint">Generated env vars</div><div className="text-3xl font-black mt-1 text-blue-300">{countEnvVars()}</div></div>
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
                    {visibleSensors.map(type => {
                      const sensor = catalog[type];
                      const enabled = activeSensors.some(s => s.type === type);
                      const selected = activeSensors.some(s => s.type === type && s.id === selectedSensorId);
                      const isDefaultSensor = type === 'host';
                      const actionLabel = isDefaultSensor && enabled ? 'Default' : enabled ? 'On' : 'Add';
                      return (
                        <div key={type} className={`catalog-row catalog-available ${selected ? 'selected' : ''}`} onClick={() => enableOrSelectSensor(type)}>
                          <div><span className={`status-pill ${isDefaultSensor && enabled ? 'state-default' : enabled ? 'btn-green' : ''}`}>{actionLabel}</span></div>
                          <div><div className="font-bold truncate">{sensor.label}</div><div className="hint truncate">{sensor.yamlKey}</div></div>
                          <div className="hint truncate">{sensor.category}</div>
                          <div className="hint text-right">{sensor.env.length ? `${sensor.env.length} env` : 'no env'}</div>
                        </div>
                      );
                    })}
                    {!visibleSensors.length && <div className="empty-state"><div className="font-black text-white mb-1">No sensors found</div><div className="hint">Try another search term or switch to All categories.</div></div>}
                  </div>
                </div>

                <div className="box p-0 min-h-0 flex flex-col">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <div><div className="title text-sm">Enabled sensors in generated YAML</div><div className="hint">Blocks that will be written to configuration.yaml</div></div>
                    <button className="btn btn-red" onClick={() => { setActiveSensors([createDefaultHostSensor()]); setSelectedSensorId('required-host'); }}>Clear</button>
                  </div>
                  <div className="scroll-y flex-1">
                    {sortedActiveSensors.map(sensor => {
                      const meta = catalog[sensor.type];
                      const selected = sensor.id === selectedSensorId;
                      const missing = missingCount(sensor);
                      const state = sensor.required
                        ? <span className="state-badge state-default">Default</span>
                        : missing
                          ? <span className="state-badge state-missing">Missing {missing}</span>
                          : <span className="state-badge state-ready">Ready</span>;
                      return (
                        <div key={sensor.id} className={`catalog-row catalog-enabled ${selected ? 'selected' : ''} ${missing ? 'row-missing' : ''}`} onClick={() => setSelectedSensorId(sensor.id)}>
                          <div><span className="status-pill">{sensor.required ? 'Required' : 'Edit'}</span></div>
                          <div><div className="font-bold truncate">{meta.label}</div><div className="hint truncate">Written to YAML</div></div>
                          <div>{state}</div>
                          <div className="text-right">{sensor.required ? <span className="hint">Locked</span> : <button className="btn btn-red icon-btn" onClick={event => { event.stopPropagation(); removeSensor(sensor.id); }} aria-label={`Remove ${meta.label}`}>x</button>}</div>
                        </div>
                      );
                    })}
                    {!activeSensors.length && <div className="empty-state"><div className="font-black text-white mb-1">No sensors selected</div><div className="hint">Pick a sensor from the left catalog. The YAML output updates immediately.</div></div>}
                  </div>
                </div>
              </div>

              <div className="box min-h-0 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div><div className="title text-sm">Sensor configuration</div><div className="hint">{selectedSensor ? `${catalog[selectedSensor.type]?.yamlKey} - fields generated from the official sensor definition` : 'Select a sensor from the lists above to edit its values.'}</div></div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white/10 text-slate-300">{selectedSensor ? catalog[selectedSensor.type]?.label : 'None selected'}</span>
                </div>
                <div className="scroll-y flex-1">
                  {selectedSensor ? (
                    <div className="editor-grid">
                      {catalog[selectedSensor.type].fields.map(([key, label, type]) => {
                        const value = selectedSensor.config[key];
                        const required = catalog[selectedSensor.type].requiredFields.includes(key);
                        const missing = required && !String(value || '').trim();
                        const fieldClass = `field ${required ? 'field-required' : ''} ${missing ? 'field-required-missing' : ''}`;
                        const labelClass = `hint mb-1 field-label ${required ? 'required-label' : ''} ${missing ? 'missing' : ''}`;
                        
                        if (type === 'checkbox') {
                          return (
                            <label key={key}>
                              <div className={labelClass}>{label}{required && <><span> *</span><span className="required-chip">Required</span></>}</div>
                              <select className={fieldClass} value={value ? 'true' : 'false'} onChange={e => updateSensorConfig(selectedSensor.id, key, e.target.value === 'true')}>
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                              </select>
                            </label>
                          );
                        }
                        if (type === 'select') {
                          return (
                            <label key={key}>
                              <div className={labelClass}>{label}{required && <><span> *</span><span className="required-chip">Required</span></>}</div>
                              <select className={fieldClass} value={value} onChange={e => updateSensorConfig(selectedSensor.id, key, e.target.value)}>
                                {POLL_RATES.map(rate => <option key={rate}>{rate}</option>)}
                              </select>
                            </label>
                          );
                        }
                        return (
                          <label key={key}>
                            <div className={labelClass}>{label}{required && <><span> *</span><span className="required-chip">Required</span></>}</div>
                            <input className={fieldClass} value={value || ''} onChange={e => updateSensorConfig(selectedSensor.id, key, e.target.value)} />
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state"><div className="font-black text-white mb-1">No sensor selected</div><div className="hint">Select a sensor to review its generated fields.</div></div>
                  )}
                </div>
              </div>
            </div>

            <div className={`grid grid-rows-[auto_1fr] gap-3 h-full ${workspaceMode !== 'compare' ? 'hidden-panel' : ''}`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="box"><div className="title text-sm">File A</div><div className="hint mt-1">Current generated YAML</div><button className="btn mt-3" onClick={() => setWorkspaceMode('compare')}>Use generated YAML</button></div>
                <div className="box"><div className="title text-sm">File B</div><div className="hint mt-1">{compareName}</div><button className="btn mt-3" onClick={() => document.getElementById('diffUploadB')?.click()}>Upload compare YAML</button></div>
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-3 min-h-0">
                <div className="box p-0 flex flex-col min-h-0"><div className="px-3 py-2 border-b border-white/10"><div className="title text-sm">Differences</div><div className="hint">What exists in one file and differs from the other</div></div><div className="output-code rounded-none border-0" dangerouslySetInnerHTML={{ __html: diffHtml }} /></div>
                <div className="box p-0 flex flex-col min-h-0"><div className="px-3 py-2 border-b border-white/10"><div className="title text-sm">Compare validation</div><div className="hint">Syntax and risk findings for comparison workflow</div></div><div className="scroll-y p-3 space-y-2">{compareIssues.map((item, index) => <div key={index} className="audit-row"><span className="dot" style={{ background: issueColor(item.type) }} /><div><div className="font-bold">{item.title}</div><div className="hint">{item.detail}</div></div></div>)}</div></div>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head">
            <div><div className="label">Result</div><div className="title">Output preview</div></div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${issues.some(item => item.type === 'error' || item.type === 'security') ? 'bg-red-500/20 text-red-200' : issues.some(item => item.type === 'warning') ? 'bg-yellow-500/20 text-yellow-200' : 'bg-green-500/20 text-green-200'}`}>
              {issues.some(item => item.type === 'error' || item.type === 'security') ? 'Needs input' : issues.some(item => item.type === 'warning') ? 'Warning' : 'Ready'}
            </span>
          </div>
          <div className="panel-body flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap gap-2">
                <button className={`tab ${outputTab === 'yaml' ? 'active' : ''}`} onClick={() => setOutputTab('yaml')}>configuration.yaml</button>
                <button className={`tab ${outputTab === 'env' ? 'active' : ''}`} onClick={() => setOutputTab('env')}>.env.example</button>
                <button className={`tab ${outputTab === 'bob' ? 'active' : ''}`} onClick={() => setOutputTab('bob')}>Bob notes</button>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => navigator.clipboard.writeText(currentOutput())}>Copy</button>
                <button className="btn btn-primary" onClick={downloadCurrentOutput}>Download</button>
              </div>
            </div>
            {outputTab === 'env' ? (
              <><div className="flex items-center justify-between mb-3"><div><div className="title text-sm">.env.example</div><div className="hint">Generated environment placeholders</div></div></div><pre className="output-code">{envOutput}</pre></>
            ) : outputTab === 'bob' ? (
              <><div className="box mb-3"><div className="title text-sm">IBM Bob usage notes</div><div className="hint mt-1">For the hackathon story, Bob IDE supports implementation, review, testing and documentation. Exported sessions go into bob_sessions.</div></div><button className="btn btn-primary w-full mb-3" onClick={runBobAnalysis}>Generate Bob notes</button><div className="scroll-y space-y-2 flex-1">{(bobNotes.length ? bobNotes : ['Run analysis to generate implementation notes for Bob IDE, SRE validation and migration logic.']).map((note, index) => <div className="audit-row" key={index}><span className="dot" style={{ background: 'var(--cyan)' }} /><div>{note}</div></div>)}</div></>
            ) : (
              <><div className="flex items-center justify-between mb-3"><div><div className="title text-sm">configuration.yaml</div><div className="hint">Generated from selected sensors and tags</div></div></div><pre className="output-code">{yamlOutput}</pre></>
            )}
            <div className="audit-strip">
              <div className="flex items-center justify-between mb-2">
                <div><div className="title text-sm">Validation findings</div><div className="hint">Required fields and security warnings</div></div>
                <span className="text-xs rounded-full bg-white/10 px-2 py-1 text-slate-300">{visibleIssues.length} finding(s)</span>
              </div>
              <div className="scroll-y space-y-2 flex-1 pr-1">
                {visibleIssues.length ? visibleIssues.map((item, index) => (
                  <div key={index} className="audit-row">
                    <span className="dot" style={{ background: issueColor(item.type) }} />
                    <div><div className="font-bold">{item.title}</div><div className="hint">{item.detail}</div></div>
                  </div>
                )) : (
                  <div className="empty-state compact"><div className="font-black text-white mb-1">Ready to export</div><div className="hint">No blocking findings detected.</div></div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

// Made with Bob
