// Toolkit views: landing, artifact, CLAUDE.md builder.
import { TOOLKIT, BUILDER_SECTIONS } from '../toolkit-data.js';
import { lsGet, lsSet, lsDel, el, clear, announce } from '../runtime.js';
import { mountEditor } from '../editor.js';
import { copyToClipboard } from '../copy.js';
import { renderNotFound } from './main.js';

export function renderToolkit() {
  const wrap = el('article', { 'aria-labelledby': 'tk-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'tk-h1' }, 'Make your own.'));
  wrap.appendChild(el('p', { class: 'home-tagline' }, 'Templates to copy, generator prompts to paste, builders to interact with. Three modalities for the same artifact.'));

  // Templates
  wrap.appendChild(el('div', { class: 'toolkit-section' }, [
    el('h2', null, 'Static templates'),
    el('p', { class: 'toolkit-tagline' }, 'Copy, paste, edit. For when you know what you want.'),
    el('div', { class: 'toolkit-grid' }, TOOLKIT.templates.map(t =>
      el('a', { class: 'toolkit-card', href: '#/toolkit/template/' + t.slug }, [
        el('span', { class: 'toolkit-card-tag' }, 'Template'),
        el('div', { class: 'toolkit-card-title' }, t.title),
        el('p', { class: 'toolkit-card-desc' }, t.description)
      ])
    ))
  ]));

  // Generators
  wrap.appendChild(el('div', { class: 'toolkit-section' }, [
    el('h2', null, 'Generator prompts'),
    el('p', { class: 'toolkit-tagline' }, 'Paste into Claude. Drives an interview, outputs a tailored artifact.'),
    el('div', { class: 'toolkit-grid' }, TOOLKIT.generators.map(g =>
      el('a', { class: 'toolkit-card', href: '#/toolkit/generator/' + g.slug }, [
        el('span', { class: 'toolkit-card-tag' }, 'Generator'),
        el('div', { class: 'toolkit-card-title' }, g.title),
        el('p', { class: 'toolkit-card-desc' }, g.description)
      ])
    ))
  ]));

  // Builders
  wrap.appendChild(el('div', { class: 'toolkit-section' }, [
    el('h2', null, 'Build your own'),
    el('p', { class: 'toolkit-tagline' }, 'Pick options. Output renders live. Drafts auto-save.'),
    el('div', { class: 'toolkit-grid' }, [
      el('a', { class: 'toolkit-card', href: '#/toolkit/builder/claude-md' }, [
        el('span', { class: 'toolkit-card-tag' }, 'Builder'),
        el('div', { class: 'toolkit-card-title' }, 'CLAUDE.md builder'),
        el('p', { class: 'toolkit-card-desc' }, 'Eight sections. Pickable option blocks. Live markdown output. Drafts persist.')
      ])
    ])
  ]));

  // Utilities
  const utilities = [
    { slug: 'token-counter', title: 'Token counter & visualizer', desc: '6 tokenizers. Counter mode + Visualizer mode showing approximate subword boundaries.' },
    { slug: 'cost-calculator', title: 'Cost calculator', desc: 'Tokens x calls x users x days. Cache + batch discounts. Cross-vendor comparison.' },
    { slug: 'prompt-linter', title: 'Prompt linter', desc: '8-rubric heuristic scoring with optional LLM-as-judge critique.' },
    { slug: 'latency-budget', title: 'Latency budget', desc: 'Voice-agent round-trip calculator. VAD + STT + LLM + TTS + network sliders.' },
    { slug: 'json-schema', title: 'JSON Schema generator', desc: 'Plain language → Pydantic class + JSON Schema. Heuristic + AI modes.' },
    { slug: 'system-prompt-analyzer', title: 'System prompt analyzer', desc: '8-point checklist for production system prompts.' },
    { slug: 'resume-bullets', title: 'Resume bullets', desc: 'AI engineering bullets from your completed modules. Heuristic + AI polish.' },
    { slug: 'portfolio-ideas', title: 'Portfolio ideas', desc: '5 buildable projects scoped to your activity.' }
  ];
  wrap.appendChild(el('div', { class: 'toolkit-section' }, [
    el('h2', null, 'Working tools'),
    el('p', { class: 'toolkit-tagline' }, 'Utilities for the work you actually do. All work without an API key; richer with one.'),
    el('div', { class: 'toolkit-grid' }, utilities.map(u =>
      el('a', { class: 'toolkit-card', href: '#/toolkit/utility/' + u.slug }, [
        el('span', { class: 'toolkit-card-tag' }, 'Utility'),
        el('div', { class: 'toolkit-card-title' }, u.title),
        el('p', { class: 'toolkit-card-desc' }, u.desc)
      ])
    ))
  ]));

  return { node: wrap, title: 'Toolkit', crumbs: [{ label: 'Toolkit' }], mainClass: 'no-rail' };
}

export function renderToolkitArtifact(type, slug) {
  if (type === 'builder' && slug === 'claude-md') return renderClaudeMdBuilder();
  let item = null;
  if (type === 'template') item = TOOLKIT.templates.find(t => t.slug === slug);
  else if (type === 'generator') item = TOOLKIT.generators.find(g => g.slug === slug);
  if (!item) return renderNotFound('Toolkit artifact "' + type + '/' + slug + '" not found.');

  const wrap = el('article', { 'aria-labelledby': 'tk-art-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, type === 'template' ? 'Template' : 'Generator prompt'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'tk-art-h1' }, item.title));
  wrap.appendChild(el('p', { class: 'home-tagline' }, item.description));

  const editorContainer = el('div', { style: 'margin-top: 24px;' });
  wrap.appendChild(editorContainer);
  mountEditor({
    container: editorContainer,
    originalText: item.content,
    type: type,
    slug: item.slug,
    monospace: true,
    label: item.title
  });

  return {
    node: wrap,
    title: item.title,
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: item.title }],
    mainClass: 'no-rail'
  };
}

export function renderClaudeMdBuilder() {
  const wrap = el('article', { 'aria-labelledby': 'bld-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Builder'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'bld-h1' }, 'CLAUDE.md builder'));
  wrap.appendChild(el('p', { class: 'home-tagline' }, 'Pick options per section. Output renders live below. Drafts auto-save to localStorage.'));

  const draftKey = 'builder_draft_claude_md';
  const draft = lsGet(draftKey, {});

  const layout = el('div', { class: 'builder' });
  const form = el('form', { class: 'builder-form', id: 'claude-md-form', 'aria-labelledby': 'bld-form-h' });
  form.appendChild(el('h2', { id: 'bld-form-h', class: 'sr-only' }, 'Configure'));

  for (const section of BUILDER_SECTIONS) {
    const block = el('section', { class: 'builder-section' });
    block.appendChild(el('h3', null, section.title));
    block.appendChild(el('p', { class: 'prompt' }, section.prompt));

    if (section.kind === 'radio') {
      const list = el('ul', { class: 'builder-options', role: 'radiogroup', 'aria-label': section.title });
      section.options.forEach((opt, i) => {
        const id = 'bld-' + section.key + '-' + opt.value;
        const checked = (draft[section.key] && draft[section.key].value === opt.value) || (!draft[section.key] && i === 0);
        const item = el('li', null, el('label', { for: id }, [
          el('input', { type: 'radio', name: 'bld-' + section.key, id, value: opt.value }),
          el('span', null, opt.label)
        ]));
        list.appendChild(item);
        if (checked) item.querySelector('input').checked = true;
      });
      block.appendChild(list);
    } else if (section.kind === 'checkbox') {
      const list = el('ul', { class: 'builder-options' });
      const selectedSet = new Set((draft[section.key] && draft[section.key].values) || section.options.map(o => o.value));
      section.options.forEach(opt => {
        const id = 'bld-' + section.key + '-' + opt.value;
        const item = el('li', null, el('label', { for: id }, [
          el('input', { type: 'checkbox', name: 'bld-' + section.key, id, value: opt.value }),
          el('span', null, opt.label)
        ]));
        const inp = item.querySelector('input');
        inp.checked = selectedSet.has(opt.value);
        list.appendChild(item);
      });
      block.appendChild(list);
    } else if (section.kind === 'textarea') {
      const ta = el('textarea', {
        class: 'builder-custom',
        id: 'bld-' + section.key + '-text',
        'aria-label': section.title
      });
      ta.value = (draft[section.key] && draft[section.key].text) || section.defaultText || '';
      block.appendChild(ta);
    }
    if (section.kind !== 'textarea') {
      const customId = 'bld-' + section.key + '-custom';
      const custom = el('textarea', {
        class: 'builder-custom',
        id: customId,
        placeholder: 'Custom additions or overrides (optional)',
        'aria-label': section.title + ' custom additions'
      });
      custom.value = (draft[section.key] && draft[section.key].custom) || '';
      block.appendChild(custom);
    }
    form.appendChild(block);
  }

  const outputPane = el('div', { class: 'builder-output-pane' });
  outputPane.appendChild(el('h2', { id: 'bld-out-h', class: 'sr-only' }, 'Output'));
  const outputPre = el('pre', { class: 'builder-output', 'aria-live': 'polite' });
  outputPane.appendChild(outputPre);
  const outputActions = el('div', { class: 'builder-output-actions' });
  const copyBtn = el('button', { class: 'btn btn-primary', type: 'button' }, 'Copy to clipboard');
  const resetBtn = el('button', { class: 'btn', type: 'button' }, 'Reset draft');
  outputActions.appendChild(copyBtn);
  outputActions.appendChild(resetBtn);
  outputPane.appendChild(outputActions);

  layout.appendChild(form);
  layout.appendChild(outputPane);
  wrap.appendChild(layout);

  function buildMarkdown() {
    const lines = ['# Project: {project name}', ''];
    for (const section of BUILDER_SECTIONS) {
      lines.push('## ' + section.title);
      if (section.kind === 'radio') {
        const sel = form.querySelector('input[name="bld-' + section.key + '"]:checked');
        const val = sel ? sel.value : section.options[0].value;
        const opt = section.options.find(o => o.value === val);
        if (opt) lines.push(opt.text || ('- ' + opt.label));
      } else if (section.kind === 'checkbox') {
        const checked = Array.from(form.querySelectorAll('input[name="bld-' + section.key + '"]:checked'));
        for (const c of checked) {
          const opt = section.options.find(o => o.value === c.value);
          if (opt) lines.push('- ' + opt.label);
        }
        if (!checked.length) lines.push('- (none selected)');
      } else if (section.kind === 'textarea') {
        const ta = form.querySelector('#bld-' + section.key + '-text');
        if (ta && ta.value.trim()) lines.push(ta.value.trim());
        else if (section.defaultText) lines.push(section.defaultText);
      }
      if (section.kind !== 'textarea') {
        const custom = form.querySelector('#bld-' + section.key + '-custom');
        if (custom && custom.value.trim()) lines.push(custom.value.trim());
      }
      lines.push('');
    }
    return lines.join('\n');
  }

  function persistDraft() {
    const next = {};
    for (const section of BUILDER_SECTIONS) {
      if (section.kind === 'radio') {
        const sel = form.querySelector('input[name="bld-' + section.key + '"]:checked');
        next[section.key] = { value: sel ? sel.value : null };
        const custom = form.querySelector('#bld-' + section.key + '-custom');
        if (custom) next[section.key].custom = custom.value;
      } else if (section.kind === 'checkbox') {
        const checked = Array.from(form.querySelectorAll('input[name="bld-' + section.key + '"]:checked'));
        next[section.key] = { values: checked.map(c => c.value) };
        const custom = form.querySelector('#bld-' + section.key + '-custom');
        if (custom) next[section.key].custom = custom.value;
      } else {
        const ta = form.querySelector('#bld-' + section.key + '-text');
        next[section.key] = { text: ta ? ta.value : '' };
      }
    }
    lsSet(draftKey, next);
  }

  function refresh() { outputPre.textContent = buildMarkdown(); }
  form.addEventListener('input', () => { persistDraft(); refresh(); });
  form.addEventListener('change', () => { persistDraft(); refresh(); });
  copyBtn.addEventListener('click', (e) => copyToClipboard(outputPre.textContent, e.currentTarget));
  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset the builder draft? Your selections will return to defaults.')) return;
    lsDel(draftKey);
    announce('Draft reset.');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  refresh();

  return {
    node: wrap,
    title: 'CLAUDE.md builder',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'CLAUDE.md builder' }],
    mainClass: 'no-rail'
  };
}
