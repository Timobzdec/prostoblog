// Client-side JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const postsDiv = document.getElementById('posts');

    // Fetch posts from server (placeholder)
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <small>${new Date(post.date).toLocaleDateString()}</small>
                `;
                postsDiv.appendChild(postDiv);
            });
        })
        .catch(error => console.error('Error fetching posts:', error));
});