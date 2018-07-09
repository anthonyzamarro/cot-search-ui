//our search object
let searchBooksObj = {}
//array for inputting and deleting licenses
let licenseArray = [];

//the URL base with which we can concat/specify our endpoints
const baseUrl = `http://52.11.188.162/`;

//POST to /search to retrieve data
function searchBooks() {
  //if object is empty, ask user to enter data to see results
  if (Object.keys(searchBooksObj).length === 0) {
    alert('Please, enter some data to see results.')
    return;
  };
  //this log is just to double-check the actual body of the object we're sending
  console.log(JSON.stringify(searchBooksObj));
  fetch(baseUrl + 'search', {
    body: JSON.stringify(searchBooksObj),
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  }).then(response => response.json())
    .then(data => {
      buildList(data);
    })
    .catch(error => {
      alert('Sorry, something went wrong. Please, try again later.');
      console.error(error);
    });
}


//kick things off when the page loads
function init() {
  getTitle();
  getLicences();
  getDisciplines();
  // getEditors();
  getAuthors();
  getPeerReviews();
  getAncillaries();
  getRepositories();
}

//invoke searchBooks and send POST request
const searchButton = document.getElementById('search-button');
searchButton.addEventListener("click", () => {
  searchBooks();
  clear();
});
//clear input text fields and clear object
const clearButton = document.getElementById('clear-button');
clearButton.addEventListener('click', () => {
  searchBooksObj = {};
  licenseArray = [];
  document.querySelectorAll('[type="text"]').forEach(input => input.value = '');
  clear();
});

//this populates/GETs disciplines. populate searchBooksObj's tagIds key
function getDisciplines()  {
  const disciplineList = document.querySelector('#disciplines');
  fetch(baseUrl + 'tag')
    .then(disciplineResponse => disciplineResponse.json())
    .then(disciplines => {
      const lists = disciplines.map((i) => [i.name, i.id]  );
      //use awesomplete js library to dynamically list tags
      new Awesomplete(disciplineList, {
        list: lists,
        replace: function(name) {
         this.input.value = name.label
      }
    });
    //get selected tag and populate tag key in searchBookObj to POST
    disciplineList.addEventListener("awesomplete-select", function (event) {
      searchBooksObj.tagIds = [event.text.value];
    });
  })
  .catch(error => {
      alert('Sorry, something went wrong. Please, try again later.');
      console.error(error);
    });
}

//get title from user input and populate searchBookObj's partialTitle key
function getTitle() {
  const title = document.querySelector('#title');
  title.addEventListener('change', (e) => {
    if (title.value !== '') {
      searchBooksObj.partialTitle = e.target.value;
    }
  });
}

//  Anthony's Notes:
//  As of right now, I'm not sure how I can populate the same text input
//  with two different endpoints and be able to select the values using
//  the awesomplete library. Since we have many more authors than editors,
//  I will just populate the input with authors for now.

//get editor from user input and populate searchBookObj's auhthorId key
// function getEditors() {
//   const editorsList = document.querySelector('#author-name');
//   fetch(baseUrl + 'editors')
//     .then(response => response.json())
//     .then(editors => {
//       const lists = editors.map((i) => [i.name, i.id]);
//       //use awesomplete js library to dynamically list editors
//       new Awesomplete(editorsList, {
//         list: lists,
//         replace: function(name) {
//           this.input.value = name.label
//         }
//       });
//       //get selected editor and populate tag key in searchBookObj to POST
//       editorsList.addEventListener("awesomplete-select", function(event) {
//         searchBooksObj.editorIds = [event.text.value];
//       });
//     })
//     .catch(error => console.error(error));
// }

function getAuthors() {
  const authorsList = document.querySelector('#author-name');
  fetch(baseUrl + 'authors')
    .then(response => response.json())
    .then(authors => {
      const lists = authors.map((i) => [i.name, i.id]);
      //use awesomplete js library to dynamically list authors
      new Awesomplete(authorsList, {
        list: lists,
        replace: function(name) {
          this.input.value = name.label
        }
      });
      //get selected author and populate tag key in searchBookObj to POST
      authorsList.addEventListener("awesomplete-select", function(event) {
        searchBooksObj.authorIds = [event.text.value];
      });
    })
    .catch(error => console.error(error));
}

//this both lists license values and gets custom license search.
//populates searchBooksObj's licensesCodes key
function getLicences() {
  //these are the licenses provided from the spec that the user can select in a dropdown format
  const licenses = ["None", "CC BY", "CC BY-NC", "CC BY-NC-ND", "CC BY-NC-SA", "CC BY-SA", "EMUCL", "GFDL", "GGPL", "OPL", "PD"]
  const licenseList = document.getElementById('license-select');
  const licenseSearch = document.getElementById('license-search');
  // populate the license list
  for(let i = 0; i < licenses.length; i++) {
    const licenseListItem = document.createElement("option");
    licenseListItem.textContent = licenses[i];
    licenseListItem.value = licenses[i];
    licenseList.appendChild(licenseListItem);
  }
  // grab selected license from list and push to array
  licenseList.addEventListener('change', (item) => {
    licenseArray.push(item.target.value);
  });
  // grab license typed in by user and push to array
  licenseSearch.addEventListener('change', (item) => {
    licenseArray.push(item.target.value);
  });
  // each time a license is added seperately, make sure the array is not empty
  // and set the add the license array to the searchBooksObject
  [licenseList, licenseSearch].forEach(license => {
    license.addEventListener('change', (e) => {
      if (licenseArray.length > 0) {
        searchBooksObj.licenseCodes = licenseArray;
      }
    });
  });
}

function getPeerReviews() {
  const peerReview = document.querySelector('#peer-reviews');
  peerReview.addEventListener('change', (e) => {
    if (e.target.value === 'yes') {
      searchBooksObj.hasReview = true;
    } else {
      searchBooksObj.hasReview = false;
    }
  });
}

function getAncillaries() {
  const ancillaries = document.querySelector('#ancillaries');
  ancillaries.addEventListener('change', (e) => {
    if (e.target.value === 'yes') {
      searchBooksObj.hasAncillaries = true;
      searchBooksObj.hasAncillary = true;
    } else {
      searchBooksObj.hasAncillaries = false;
      searchBooksObj.hasAncillary = false;
    }
  });
}

//this populates/GETs the repositories. populates searchBooksObj's repositories key
function getRepositories() {
  const respository = document.querySelector('#repository');
  fetch(baseUrl + 'repositories')
    .then(response => response.json())
    .then(repositories => {
      const lists = repositories.map((i) => [i.name, i.id]);
      //use awesomplete js library to dynamically list repositories
      new Awesomplete(repository, {
        list: lists,
        replace: function(name) {
          this.input.value = name.label
        }
      });
      repository.addEventListener("awesomplete-select", function(event) {
        if (event.target.value !== '') {
          searchBooksObj.repositoryIds = [event.text.value];
        }
      });
    })
    .catch(error => console.error(error));
}

const list = document.getElementById('list');
// Build the results list from the user input
function buildList(searchResults) {
  searchResults.forEach(result => {
    let li = `<li>
                <p><strong>Title</strong>: ${result.title}</p>
                <p><strong>Author/Editor</strong>: ${result.authors.length > 0 ? result.authors.map(author => author.name).join(' ') : 'Not found'}  </p>
                <p><strong>Resource URL</strong>: ${result.url}</p>
                <p><strong>Discipline</strong>: ${result.tags.length > 0 ? result.tags.map(tag => tag.name).join(' ') : 'Not found' }</p>
                <p><strong>Repository</strong>: ${result.repository.name}</p>
                <p><strong>License</strong>: ${result.license.name !== null && result.license.name.length < 12 ? result.license.name : 'Custom'}</p>
                <p><strong>Peer Reviews</strong>: ${result.reviews !== null ? result.reviews :  'Not found'}</p>
                <p><strong>Ancillaries</strong>: ${result.ancillariesUrl !== null ? result.ancillariesUrl : 'Not found'}</p>
              </li>
              <br>`
  list.insertAdjacentHTML('beforeend', li);
  });
}


//this just erases the unordered list when the user makes multiple searches.
function clear() {
  document.getElementById('list').innerHTML = "";
};
document.addEventListener("DOMContentLoaded", init);
