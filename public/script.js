const API_BASE = '';

// Состояние приложения
let isAuthenticated = false;
let currentUser = null;
let posts = [];

// DOM элементы
const authSection = document.getElementById('auth-section');
const adminPanel = document.getElementById('admin-panel');
const newPostBtn = document.getElementById('new-post-btn');
const postForm = document.getElementById('post-form');
const postIdInput = document.getElementById('post-id');
const postTitleInput = document.getElementById('post-title');
const postContentInput = document.getElementById('post-content');
const cancelBtn = document.getElementById('cancel-btn');
const postsContainer = document.getElementById('posts-container');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadPosts();
  setupEventListeners();
});

function setupEventListeners() {
  newPostBtn.addEventListener('click', () => showPostForm());
  postForm.addEventListener('submit', handlePostSubmit);
  cancelBtn.addEventListener('click', hidePostForm);
}

// ========== Аутентификация ==========
async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth/status');
    const data = await res.json();
    isAuthenticated = data.authenticated;
    currentUser = data.username;
    renderAuthUI();
    if (isAuthenticated) {
      adminPanel.style.display = 'block';
    } else {
      adminPanel.style.display = 'none';
    }
  } catch (err) {
    console.error('Ошибка проверки авторизации:', err);
  }
}

function renderAuthUI() {
  if (isAuthenticated) {
    authSection.innerHTML = `
      <p>Привет, ${currentUser}! <button id="logout-btn">Выйти</button></p>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    authSection.innerHTML = `
      <form class="login-form" id="login-form">
        <input type="text" id="username" placeholder="Логин" required>
        <input type="password" id="password" placeholder="Пароль" required>
        <button type="submit">Войти</button>
      </form>
    `;
    document.getElementById('login-form').addEventListener('submit', login);
  }
}

async function login(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      await checkAuthStatus();
      loadPosts(); // обновим посты (покажутся кнопки управления)
    } else {
      const err = await res.json();
      alert(err.error);
    }
  } catch (err) {
    console.error('Ошибка входа:', err);
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    await checkAuthStatus();
    loadPosts();
  } catch (err) {
    console.error('Ошибка выхода:', err);
  }
}

// ========== Работа с постами ==========
async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    posts = await res.json();
    renderPosts();
  } catch (err) {
    console.error('Ошибка загрузки постов:', err);
    postsContainer.innerHTML = '<p>Ошибка загрузки постов</p>';
  }
}

function renderPosts() {
  if (posts.length === 0) {
    postsContainer.innerHTML = '<div class="empty-message">Пока нет ни одного поста.</div>';
    return;
  }

  let html = '';
  posts.forEach(post => {
    const date = new Date(post.created_at).toLocaleString('ru-RU');
    html += `
      <div class="post-card" data-id="${post.id}">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <div class="post-meta">${date}</div>
        <div class="post-content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
    `;
    if (isAuthenticated) {
      html += `
        <div class="post-actions">
          <button class="edit-post" data-id="${post.id}">✏️ Редактировать</button>
          <button class="delete-post danger" data-id="${post.id}">🗑️ Удалить</button>
        </div>
      `;
    }
    html += `</div>`;
  });

  postsContainer.innerHTML = html;

  if (isAuthenticated) {
    document.querySelectorAll('.edit-post').forEach(btn => {
      btn.addEventListener('click', (e) => editPost(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-post').forEach(btn => {
      btn.addEventListener('click', (e) => deletePost(e.target.dataset.id));
    });
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showPostForm(post = null) {
  if (post) {
    postIdInput.value = post.id;
    postTitleInput.value = post.title;
    postContentInput.value = post.content;
  } else {
    postIdInput.value = '';
    postTitleInput.value = '';
    postContentInput.value = '';
  }
  postForm.style.display = 'block';
  newPostBtn.style.display = 'none';
}

function hidePostForm() {
  postForm.style.display = 'none';
  newPostBtn.style.display = 'inline-block';
}

async function handlePostSubmit(e) {
  e.preventDefault();
  const id = postIdInput.value;
  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();

  if (!title || !content) {
    alert('Заполните все поля');
    return;
  }

  const postData = { title, content };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/posts/${id}` : '/api/posts';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    if (res.ok) {
      hidePostForm();
      loadPosts();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  } catch (err) {
    console.error('Ошибка сохранения поста:', err);
  }
}

function editPost(id) {
  const post = posts.find(p => p.id == id);
  if (post) {
    showPostForm(post);
  }
}

async function deletePost(id) {
  if (!confirm('Удалить пост?')) return;
  try {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadPosts();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  } catch (err) {
    console.error('Ошибка удаления:', err);
  }
}