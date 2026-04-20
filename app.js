// ===== CORE APP JAVASCRIPT =====
// This file contains utility functions used across all pages

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Ensure localStorage has necessary data structures
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
    if (!localStorage.getItem('blogPosts')) {
        localStorage.setItem('blogPosts', JSON.stringify([]));
    }
    if (!localStorage.getItem('analytics')) {
        localStorage.setItem('analytics', JSON.stringify([]));
    }
}

// ===== LOCAL STORAGE UTILITIES =====

// Get all products
function getAllProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
}

// Get all blog posts
function getAllBlogPosts() {
    return JSON.parse(localStorage.getItem('blogPosts') || '[]');
}

// Get all analytics
function getAllAnalytics() {
    return JSON.parse(localStorage.getItem('analytics') || '[]');
}

// Get product by ID
function getProductById(id) {
    const products = getAllProducts();
    return products.find(p => p.id === id);
}

// Get blog post by slug
function getBlogPostBySlug(slug) {
    const posts = getAllBlogPosts();
    return posts.find(p => p.slug === slug);
}

// ===== ANALYTICS FUNCTIONS =====

// Track product click
function trackProductClick(productId) {
    const analytics = getAllAnalytics();
    analytics.push({
        productId: productId,
        timestamp: new Date().toISOString(),
        type: 'click'
    });
    localStorage.setItem('analytics', JSON.stringify(analytics));

    // Update product click count
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
        product.clicks = (product.clicks || 0) + 1;
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Get click count for product
function getProductClickCount(productId) {
    const analytics = getAllAnalytics();
    return analytics.filter(a => a.productId === productId).length;
}

// Get top products
function getTopProducts(limit = 10) {
    const products = getAllProducts();
    return products
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, limit);
}

// Get clicks by category
function getClicksByCategory(category) {
    const analytics = getAllAnalytics();
    const products = getAllProducts();
    const categoryProducts = products.filter(p => p.category === category);
    
    return analytics.filter(a => 
        categoryProducts.some(p => p.id === a.productId)
    ).length;
}

// Get analytics by date range
function getAnalyticsByDateRange(startDate, endDate) {
    const analytics = getAllAnalytics();
    return analytics.filter(a => {
        const date = new Date(a.timestamp);
        return date >= startDate && date <= endDate;
    });
}

// ===== DATE UTILITIES =====

// Get today's clicks
function getTodaysClicks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return getAnalyticsByDateRange(today, tomorrow).length;
}

// Get this week's clicks
function getWeeksClicks() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return getAnalyticsByDateRange(weekAgo, now).length;
}

// Get this month's clicks
function getMonthsClicks() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return getAnalyticsByDateRange(monthStart, now).length;
}

// ===== FORMATTING UTILITIES =====

// Format price
function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
}

// Calculate read time
function calculateReadTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

// ===== STRING UTILITIES =====

// Generate slug from text
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Truncate text
function truncateText(text, length = 100) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// ===== ARRAY UTILITIES =====

// Group array by property
function groupBy(array, property) {
    return array.reduce((groups, item) => {
        const value = item[property];
        if (!groups[value]) {
            groups[value] = [];
        }
        groups[value].push(item);
        return groups;
    }, {});
}

// Sort array by property
function sortByProperty(array, property, descending = false) {
    return array.sort((a, b) => {
        if (a[property] < b[property]) return descending ? 1 : -1;
        if (a[property] > b[property]) return descending ? -1 : 1;
        return 0;
    });
}

// Filter array by multiple properties
function filterByProperties(array, filters) {
    return array.filter(item => {
        return Object.keys(filters).every(key => {
            if (Array.isArray(filters[key])) {
                return filters[key].includes(item[key]);
            }
            return item[key] === filters[key];
        });
    });
}

// ===== SEARCH UTILITIES =====

// Search products
function searchProducts(query) {
    const products = getAllProducts();
    const q = query.toLowerCase();
    return products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
}

// Search blog posts
function searchBlogPosts(query) {
    const posts = getAllBlogPosts();
    const q = query.toLowerCase();
    return posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.metaDescription.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
}

// ===== EXPORT UTILITIES =====

// Export to CSV
function exportToCSV(data, filename = 'export.csv') {
    let csv = '';
    
    // Headers
    if (data.length > 0) {
        csv += Object.keys(data[0]).join(',') + '\n';
    }
    
    // Rows
    data.forEach(row => {
        csv += Object.values(row).map(val => {
            if (typeof val === 'string' && val.includes(',')) {
                return '"' + val.replace(/"/g, '""') + '"';
            }
            return val;
        }).join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Export to JSON
function exportToJSON(data, filename = 'export.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ===== VALIDATION UTILITIES =====

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate URL
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// Validate product data
function validateProductData(product) {
    if (!product.name || product.name.trim() === '') return false;
    if (!product.category || !['tech', 'fashion', 'home', 'gaming', 'sports', 'beauty', 'kitchen', 'office', 'outdoor'].includes(product.category)) return false;
    if (!product.price || parseFloat(product.price) <= 0) return false;
    if (!product.image || !validateURL(product.image)) return false;
    if (!product.amazonLink || !validateURL(product.amazonLink)) return false;
    if (!product.description || product.description.trim() === '') return false;
    return true;
}

// ===== UI UTILITIES =====

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease-in;
    `;
    
    const backgroundColor = type === 'success' ? '#d1fae5' : type === 'error' ? '#fee2e2' : '#dbeafe';
    const textColor = type === 'success' ? '#065f46' : type === 'error' ? '#7f1d1d' : '#082f49';
    
    notification.style.backgroundColor = backgroundColor;
    notification.style.color = textColor;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

// Loading state
function setLoadingState(element, isLoading = true) {
    if (isLoading) {
        element.disabled = true;
        element.style.opacity = '0.6';
    } else {
        element.disabled = false;
        element.style.opacity = '1';
    }
}

// ===== PAGINATION UTILITIES =====

// Paginate array
function paginate(array, page, perPage) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
        data: array.slice(start, end),
        total: array.length,
        pages: Math.ceil(array.length / perPage),
        currentPage: page
    };
}

// ===== CACHE UTILITIES =====

// Set cache
function setCache(key, value, expiryMinutes = 60) {
    const expiryTime = new Date().getTime() + (expiryMinutes * 60 * 1000);
    localStorage.setItem(key + '_cache', JSON.stringify({
        value: value,
        expiry: expiryTime
    }));
}

// Get cache
function getCache(key) {
    const cached = localStorage.getItem(key + '_cache');
    if (!cached) return null;
    
    const {value, expiry} = JSON.parse(cached);
    if (new Date().getTime() > expiry) {
        localStorage.removeItem(key + '_cache');
        return null;
    }
    
    return value;
}

// Clear cache
function clearCache(key) {
    localStorage.removeItem(key + '_cache');
}

// ===== COMPARISON UTILITIES =====

// Compare products
function compareProducts(productIds) {
    const products = getAllProducts();
    return products.filter(p => productIds.includes(p.id));
}

// ===== CATEGORY UTILITIES =====

// Get all categories
function getAllCategories() {
    return ['tech', 'fashion', 'home', 'gaming', 'sports', 'beauty', 'kitchen', 'office', 'outdoor'];
}

// Get products by category
function getProductsByCategory(category) {
    const products = getAllProducts();
    return products.filter(p => p.category === category);
}

// Get category name
function getCategoryName(category) {
    const names = {
        'tech': 'Tech',
        'fashion': 'Fashion',
        'home': 'Home',
        'gaming': 'Gaming',
        'sports': 'Sports',
        'beauty': 'Beauty',
        'kitchen': 'Kitchen',
        'office': 'Office',
        'outdoor': 'Outdoor'
    };
    return names[category] || category;
}

// ===== ERROR HANDLING =====

// Log error
function logError(error, context = '') {
    console.error(`[${context}] ${error.message || error}`);
    // Could send to error tracking service here
}

// Try-catch wrapper
function tryCatch(fn, context = '') {
    try {
        return fn();
    } catch (error) {
        logError(error, context);
        return null;
    }
}

// ===== PERFORMANCE =====

// Measure function execution time
function measureTime(fn, label = 'Function') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
}

// ===== INITIALIZATION =====

console.log('App initialized - All utilities loaded');