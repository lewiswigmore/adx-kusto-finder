document.addEventListener('keydown', function(event) {
    if (event.altKey && event.key.toLowerCase() === 's') {
      const searchUIExists = document.getElementById('adx-search-ui');
      if (!searchUIExists) {
        openSearchUI();
      }
    }
  });
  
  function openSearchUI() {
    const searchUIHtml = `
      <div id="adx-search-ui" style="position: fixed; top: 20px; right: 20px; background: white; z-index: 1000; padding: 10px; border: 1px solid #ddd;">
        <input type="text" id="adx-search-input" placeholder="Search Kusto queries..." style="width: 300px;"/>
        <ul id="adx-search-results" style="margin-top: 10px; max-height: 300px; overflow-y: auto;"></ul>
      </div>
    `;
  
    // Inject the search bar UI into the ADX page
    document.body.insertAdjacentHTML('beforeend', searchUIHtml);
    const searchInput = document.getElementById('adx-search-input');
    searchInput.focus();
  
    // Setup search event
    searchInput.addEventListener('input', debounce(function(event) {
      performSearch(event.target.value);
    }, 300));
  }
  
  function debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  
  function performSearch(searchTerm) {
    // Fetching rootStore from local storage using the scripting API
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: fetchTabsData,
      args: [searchTerm]
    }, (injectionResults) => {
      // The injectionResults will contain return value from fetchTabsData function
      // You should handle the results here and call a function to display them
      // For example, displaySearchResults(injectionResults[0].result);
    });
  }
  
  // This function will be injected into the page context to access the rootStore
  function fetchTabsData(searchTerm) {
    // Access rootStore from the page context
    const rootStore = JSON.parse(localStorage.getItem('rootStore'));
    if (rootStore) {
      const tabs = rootStore.appState.tabs.tabs;
      const matchedTabs = tabs.filter(tab => tab.text.includes(searchTerm));
      return matchedTabs;
    }
    return [];
  }
  
  function displaySearchResults(matchedTabs) {
    const resultsElement = document.getElementById('adx-search-results');
    resultsElement.innerHTML = ''; // Clear previous results
    
    matchedTabs.forEach(tab => {
      const listItem = document.createElement('li');
      listItem.textContent = tab.title;
      listItem.onclick = () => navigateToTab(tab.id);
      resultsElement.appendChild(listItem);
    });
  }
  
  function navigateToTab(tabId) {
    // TODO
    // Implementation depends on how navigation is handled in ADX
    // May need to simulate a click on a tab element
    console.log('Redirect to', tabId);
  }
  