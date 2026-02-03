// brand.js — fetch and manage brands via API
async function api(path, options = {}) {
  const res = await fetch(path, options);
  try {
    return await res.json();
  } catch (e) {
    return { success: false, error: 'Invalid JSON response' };
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadServerBrands() {
  try {
    const json = await api('/api/brands');
    if (!json || !json.success) {
      console.error('Failed to load brands', json);
      return;
    }
    const brandsData = json.data || [];
    renderBrandsFromServer(brandsData);
  } catch (err) {
    console.error(err);
  }
}

function renderBrandsFromServer(brandsData) {
  const tbody = document.getElementById('brands-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  brandsData.forEach(b => {
    const tr = document.createElement('tr');
    const id = b._id;
    const name = b.brand_name || b.name || '';
    const desc = b.description || '';
    tr.innerHTML = `
      <td class="ps-4">${escapeHtml(id)}</td>
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(desc)}</td>
      <td class="text-end pe-4">
        <div class="btn-group shadow-sm">
          <button class="btn btn-outline-secondary btn-sm" onclick="editBrand('${id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteBrand('${id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  updateStatsFromServer(brandsData);
}

function updateStatsFromServer(brandsData) {
  const total = brandsData.length;
  const totalEl = document.getElementById('total-brands-count');
  const nextEl = document.getElementById('next-id-count');
  const longEl = document.getElementById('longest-name');
  const shortEl = document.getElementById('shortest-name');
  if (totalEl) totalEl.textContent = total;
  if (nextEl) nextEl.textContent = '-';
  if (total === 0) {
    if (longEl) longEl.textContent = '-';
    if (shortEl) shortEl.textContent = '-';
    return;
  }
  const names = brandsData.map(b => b.brand_name || b.name || '');
  const longest = names.reduce((a, b) => (a.length >= b.length ? a : b), '');
  const shortest = names.reduce((a, b) => (a.length <= b.length ? a : b), names[0] || '');
  if (longEl) longEl.textContent = longest;
  if (shortEl) shortEl.textContent = shortest;
}

// Override old save/edit/delete handlers to use server API
async function saveBrand() {
  const form = document.getElementById('formBrand');
  if (!form) return;
  const nameField = form.elements['brandname'];
  const descField = form.elements['brand_description'];
  const brand_name = (nameField.value || '').trim();
  const description = (descField.value || '').trim();
  if (!brand_name) return alert('Please enter a brand name.');
  try {
    const res = await api('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_name, description }),
    });
    if (!res || !res.success) return alert('Failed to save brand: ' + (res.error || JSON.stringify(res)));
    // hide modal and reload
    form.reset();
    const modalEl = document.getElementById('modalAddBrand');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
    await loadServerBrands();
  } catch (err) {
    console.error(err);
    alert('Error saving brand');
  }
}

async function editBrand(id) {
  try {
    const currentRes = await api('/api/brands/' + id);
    if (!currentRes || !currentRes.success) return alert('Failed to fetch brand');
    const b = currentRes.data;
    const newName = prompt('Edit brand name:', b.brand_name || b.name || '');
    if (newName === null) return;
    const newDesc = prompt('Edit brand description:', b.description || '');
    if (newDesc === null) return;
    const res = await api('/api/brands/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_name: (newName || '').trim(), description: (newDesc || '').trim() }),
    });
    if (!res || !res.success) return alert('Failed to update brand');
    await loadServerBrands();
  } catch (err) {
    console.error(err);
    alert('Error updating brand');
  }
}

async function deleteBrand(id) {
  if (!confirm('Delete this brand?')) return;
  try {
    const res = await api('/api/brands/' + id, { method: 'DELETE' });
    if (!res || !res.success) return alert('Failed to delete brand');
    await loadServerBrands();
  } catch (err) {
    console.error(err);
    alert('Error deleting brand');
  }
}

function getNextId() {
  return 1; // server assigns ObjectIds; keep a harmless default for the modal
}

document.addEventListener('DOMContentLoaded', () => {
  loadServerBrands();
  const addBrandModal = document.getElementById('modalAddBrand');
  if (addBrandModal) {
    addBrandModal.addEventListener('show.bs.modal', () => {
      const idField = document.querySelector('#formBrand [name="brand_id"]');
      if (idField) idField.value = getNextId();
    });
  }
});
