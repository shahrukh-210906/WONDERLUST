document.addEventListener('DOMContentLoaded', () => {
    const results = () => document.getElementById('stay-results');
    if (!results()) return;
    let pendingUrl = new URL(location.href);
    let request;
    let sequence = 0;
    const status = document.getElementById('filter-status');
    const updateControls = (url) => {
        const categories = url.searchParams.getAll('category');
        document.querySelectorAll('[data-category]').forEach(item => {
            const active = item.dataset.category === 'All' ? !categories.length : categories.includes(item.dataset.category);
            item.classList.toggle('active', active);
            item.setAttribute('aria-current', active ? 'true' : 'false');
        });
        document.querySelectorAll('[data-sort-value]').forEach(link => {
            const next = new URL(url);
            next.searchParams.set('sort', link.dataset.sortValue);
            link.href = next.pathname + next.search;
        });
        const sortText = document.getElementById('sort-btn-text');
        const selected = [...document.querySelectorAll('[data-sort-value]')].find(link => link.dataset.sortValue === url.searchParams.get('sort'));
        if (sortText) sortText.textContent = selected ? selected.textContent.trim() : 'Sort By';
    };
    const load = async (url, push = true) => {
        request?.abort();
        request = new AbortController();
        const current = ++sequence;
        pendingUrl = url;
        updateControls(url);
        results().setAttribute('aria-busy', 'true');
        status.textContent = 'Finding your stays…';
        try {
            const response = await fetch(url, { headers: { 'X-Listing-Partial': '1' }, signal: request.signal });
            if (!response.ok || response.redirected) throw new Error('Unable to load stays');
            const page = new DOMParser().parseFromString(await response.text(), 'text/html');
            const next = page.getElementById('stay-results');
            if (!next) throw new Error('Invalid results');
            if (current !== sequence) return;
            results().replaceWith(next);
            const count = Number(next.dataset.count);
            document.querySelector('.result-count').textContent = `${count} ${count === 1 ? 'stay' : 'stays'} to explore`;
            if (push) history.pushState(null, '', url.pathname + url.search);
            status.textContent = `${count} ${count === 1 ? 'stay' : 'stays'} found`;
            document.dispatchEvent(new Event('listings:updated'));
        } catch (error) {
            if (error.name === 'AbortError' || current !== sequence) return;
            pendingUrl = new URL(location.href);
            updateControls(pendingUrl);
            status.textContent = 'Could not update stays. Please try again.';
        } finally {
            if (current === sequence) results().removeAttribute('aria-busy');
        }
    };
    document.addEventListener('click', event => {
        const item = event.target.closest('[data-category], [data-sort-value]');
        if (!item || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        const url = new URL(pendingUrl);
        if (item.dataset.sortValue) url.searchParams.set('sort', item.dataset.sortValue);
        else {
            let categories = url.searchParams.getAll('category');
            const category = item.dataset.category;
            categories = category === 'All' ? [] : categories.includes(category) ? categories.filter(value => value !== category) : [...categories, category];
            url.searchParams.delete('category');
            categories.forEach(value => url.searchParams.append('category', value));
        }
        if (item.closest('.offcanvas')) bootstrap.Offcanvas.getInstance(item.closest('.offcanvas'))?.hide();
        load(url);
    });
    window.addEventListener('popstate', () => load(new URL(location.href), false));
});
