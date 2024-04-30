document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('search-button');
  const searchQuery = document.getElementById('search-query');

  searchButton.addEventListener('click', function() {
    const searchTerm = searchQuery.value;
    if (searchTerm) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
          target: {tabId: activeTab.id},
          func: performSearch,
          args: [searchTerm]
        }, (injectionResults) => {
          // Handle search results
          // Perhaps by calling a function similar to displaySearchResults()
        });
      });
    }
  });

  // Add 'keyup' event listener for the search input box
  searchQuery.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      searchButton.click();
    }
  });

  // Set focus on the search input
  searchQuery.focus();
});

function performSearch(searchTerm) {
  // Clear any existing highlights
  const highlighted = document.querySelectorAll('.highlight');
  highlighted.forEach((el) => {
    el.classList.remove('highlight');
  });

  // Split the searchTerm into individual words
  const searchWords = searchTerm.split(' ');

  // Search for each word separately
  let totalFound = 0;
  searchWords.forEach(word => {
    const textNodes = Array.from(document.body.querySelectorAll('*'))
      .flatMap(el => Array.from(el.childNodes))
      .filter(n => n.nodeType === 3 && n.textContent.toLowerCase().includes(word.toLowerCase()));

    // Highlight the found text
    textNodes.forEach(node => {
      const newNode = document.createElement('span');
      newNode.innerHTML = node.textContent.replace(new RegExp(word, 'gi'), match => `<mark class="highlight">${match}</mark>`);
      node.parentNode.replaceChild(newNode, node);
    });

    totalFound += textNodes.length;
  });

  return { found: totalFound > 0, count: totalFound };
}
