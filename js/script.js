//Project 5 - Public API Requests//

//Global Variables//

const randUserUrl = 'https://randomuser.me/api/?nat=US&results=12'; //limits to 12 results of US data only//
const gallery = document.querySelector('.gallery');
const search = document.querySelector('.search-container');
const personData = []; //Declares an array that will store the returned random user data//
let canToggle = false; //Declares var to determine when modal window can be toggled//

//Fetch Data//
//This async function will return a promise resolved by parsing the text body as JSON//
async function getJSON(url) {
  try {
    const res = await fetch(randUserUrl);
    return await res.json(); //This returns a promise//
  } catch (error) { //catches any errors present//
    throw (error);
  }
}
//Helper Functions//
//This will convert the date to the proper format of MM/DD/YYYY//
function dateConverter(date) {
    const newDate = new Date(date);
    return new Intl.DateTimeFormat('en-US').format(newDate);
}

//This converts the cell phone number into the proper format of (xxx) xxx-xxxx //
////Credit for num converter found on: https://stackoverflow.com/questions/8358084/regular-expression-to-reformat-a-us-phone-number-in-javascript//
function phoneNumConverter(num) {
    let nonDigits = (num).replace(/\D/g, ''); //target, replace non-digit characters so we are left with numbers only
    let number = nonDigits.match(/^(\d{3})(\d{3})(\d{4})$/); //organize/"match" numbers into three groups (3,3,4)
    if(number) {
      return `(${number[1]}) ${number[2]}-${number[3]}`; //correctly format the phone number '(xxx) xxx-xxxx'
    }
  }

  //This async function will gather user data required to be displayed from api//

 //This async function will compile user data required to be displayed from api//
async function getUserList(url) {
    try {
      //Will generate 12 random users pulled from the API in one request//
      const randomUserJSON = await getJSON(url); //get a Promise by calling getJSON()//
      //maps out data from randomUserJSON in order to use the information//
      const profiles = randomUserJSON.results.map(person => {
        const image = person.picture.large;
        const fullName = `${person.name.first} ${person.name.last}`;
        const email = person.email;
        const loc = `${person.location.city}, ${person.location.state}`;
        const cellNumber = phoneNumConverter(person.cell); //Converts cell phone input to proper format (xxx) xxx-xxxx //
        const address = `${person.location.street.number} ${person.location.street.name}, ${loc} ${person.location.postcode}`;
        const birthday = dateConverter(person.dob.date); //Converts date of birth into the correct format MM/DD/YYYY //
  
        //returns all collected data var names for future use (see generateGalleryHTML())
        return { image, fullName, email, loc, cellNumber, address, birthday };
      });
      return Promise.all(profiles); //return profiles variable//
    } catch (error) {
      gallery.innerHTML = `<h1>An error occurred while fetching data.</h1>
        <h2>Please try again in a moment. If the error persists, please contact the webmaster.</h2>`
    }
  }
  
  //Function to generate HTML data to div element with id of gallery//
  function mapData(data) {
    data.map(person => {
      personData.push(person); //stores all the person data in personData array//
    });
    generateGalleryHTML(data);
  }

  function generateGalleryHTML(data){
      gallery.innerHTML = ''; //Clears the window of any previous info cards//
      //Dynamically inserts required data for 12 random user cards//
      for (let i = 0; i < data.length; i++) {
        gallery.insertAdjacentHTML('beforeend', `
          <div class="card">
              <div class="card-img-container">
                  <img class="card-img" src="${data[i].image}" alt="profile picture">
              </div>
              <div class="card-info-container">
                  <h3 id="name" class="card-name cap">${data[i].fullName}</h3>
                  <p class="card-text">${data[i].email}</p>
                  <p class="card-text cap">${data[i].loc}</p>
              </div>
          </div>
          `);
      }
      generateModalHTML(data); //initial call to generateModalHTML //
      
  }
  
  function generateModalHTML(data, index) {
      //console.log(index);//
      if(index === undefined) index = 0; //sets to 0 if there is no index argument//
      //targets new created cards of gallery class//
      const cards = gallery.children;
      //This loops through the list of cards//
      if(index === 0 && !canToggle) {
          for (let i = index; i < cards.length; i++) {
              let card = cards[i]; //Declares var for card in order to click//
              //event listener to monitor for the selected card//
              card.addEventListener('click' , () => {
                  addModalData(data, i); //Dynamically insert modal HTML
              });
          }
      } else {
          if(index < 0) index = (cards.length - 2); //cards will equal 13 because of insertAdjacentHTML //
          if(index > cards.length -2) index = 0; //Cycles back through the cards down when max value has been reached//
          gallery.lastElementChild.remove(); //removes the previous card//
          addModalData(data, index); //adds the new card to the modal window//
      }
  }

  function addModalData(data, index) {
      //Dynamically inserts the required info for the selected modal object//
      gallery.insertAdjacentHTML('beforeend', `
      <div class="modal-container">
          <div class="modal">
              <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
              <div class="modal-info-container">
                  <img class="modal-img" src="${data[index].image}" alt="profile picture">
                  <h3 id="name" class="modal-name cap">${data[index].fullName}</h3>
                  <p class="modal-text">${data[index].email}</p>
                  <p class="modal-text cap">${data[index].loc}</p>
                  <hr>
                  <p class="modal-text">${data[index].cellNumber}</p>
                  <p class="modal-text">${data[index].address}</p>
                  <p class="modal-text">Birthday: ${data[index].birthday}</p>
              </div>
          </div>
    `);

    addModalToggle(data, index) ; //This declaration can be located in the Extra Features section below//

    //Closes Modal window button//
    const modalCloseBtn = document.getElementById('modal-close-btn');
    modalCloseBtn.addEventListener('click', () => {
        gallery.lastElementChild.remove(); //removes it from the screen//
    });

  }

//Additional Features//

function addModalToggle(data, index) {
    canToggle = true;
    //dynamically adds HTML for previous and next buttons to modal window//
    const modal = document.querySelector('.modal');
    modal.insertAdjacentHTML('beforeend', `
      <div class="modal-btn-container">
          <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
          <button type="button" id="modal-next" class="modal-next btn">Next</button>
      </div>
  </div>
  `);

  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');
  modalPrev.addEventListener('click', () => {
    index--;
    generateModalHTML(data, index--); //this will enable show previous card//
  });
  modalNext.addEventListener('click', () => {
    index++;
    generateModalHTML(data, index++); //This will enable show next card//
  });
}

//This function will dynamically add a search bar to the index.html//
function searchList(names) {
    search.insertAdjacentHTML('beforeend', `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>
  `);
    
    const searchBtn = document.querySelector('.search-submit');
    const searchBar = document.querySelector('.search-input');
    //Search by using a click handler on the search button element//
    searchBtn.addEventListener('click', (e) => {
        filterNames(names);
    });

    //Active search by using the keyup event handler//
    searchBar.addEventListener('keyup', (e) => {
        filterNames(names);
    });
}

function filterNames(names) {
    const searchInputValue = document.querySelector('#search-input').value.toLowerCase(); //Targets input id of 'search-input' and converts its value to lower case//
    let filteredList = []; //This creates a new array to hold the filtered results//
    for (let i = 0; i < personData.length; i++) { //This checks to verify full name matches//
        if (personData[i].fullName.toLowerCase().include(searchInputValue)) { //This converts the name to lowercase and checks against search value input//
            filteredList.push(names[i]); //If a match, it will be added to the filteredList array//
        }
    }

    if (filteredList.length === 0) {
        gallery.innerHTML = '<h1>No search results found.</h1>'; //User is informed//
    } else {
        canToggle = false; //set to falase in order to prevent generateModalHTML () from auto opening the modal window//
        generateGalleryHTML(filteredList);
    }
}

//Call Functions//

getUserList(randUserUrl) //gets the user postData//
    .then(mapData) //passes teh data to generateHTML() //

searchList(personData); //Adds a search bar//

 