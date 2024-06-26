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
        }, handleSearchResults);
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
  // Revert all previously highlighted text back to normal
  const highlighted = document.querySelectorAll('.highlight');
  highlighted.forEach((el) => {
    // Create a new text node with the same content as the highlighted element
    const textNode = document.createTextNode(el.textContent);
    // Replace the highlighted element with the new text node
    el.parentNode.replaceChild(textNode, el);
  });
  // Split the searchTerm into individual words
  const searchWords = searchTerm.split(' ');
  // Search for each word separately
  let results = [];
  searchWords.forEach(word => {
    const textNodes = Array.from(document.body.querySelectorAll('*'))
      .flatMap(el => Array.from(el.childNodes))
      .filter(n => n.nodeType === 3 && n.textContent.toLowerCase().includes(word.toLowerCase()));
    // Highlight the found text and add each occurrence to the results array
    textNodes.forEach(node => {
      const newNode = document.createElement('span');
      newNode.innerHTML = node.textContent.replace(new RegExp(word, 'gi'), match => {
        const context = node.parentElement;
        results.push({match: match, context: context});
        return `<mark class="highlight">${match}</mark>`;
      });
      node.parentNode.replaceChild(newNode, node);
    });
  });
  return { found: results.length > 0, results: results, searchTerm: searchTerm};
}

function handleSearchResults(injectionResults) {
  // Clear any existing search results
  const searchResults = document.getElementById('search-results');
  if (searchResults) {
    searchResults.innerHTML = '';
  } else {
    console.error('Element with id "search-results" not found');
    return;
  }
  // Add a list item for each search result
  injectionResults.forEach(result => {
    result.result.results.forEach(occurrence => {
      const li = document.createElement('li');
      li.textContent = `Found occurrence of "${result.result.searchTerm}": ${occurrence.match} in ${occurrence.context}`;
      searchResults.appendChild(li);
    });
  });
}


/////////////////////////////////////////////////////////////////////////
// Added functions to find parent elements with specific classes or ids//
/////////////////////////////////////////////////////////////////////////
function findParentWithClass(node, className) {
  let parent = node.parentNode;
  while (parent) {
    if (parent.classList.contains(className)) {
      return parent;
    }
    parent = parent.parentNode;
  }
  return null; // Return null if no parent with the specified class is found
}
function findParentWithId(node, id) {
  let parent = node.parentNode;
  while (parent) {
    if (parent.id === id) {
      return parent;
    }
    parent = parent.parentNode;
  }
  return null; // Return null if no parent with the specified id is found
}

