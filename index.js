"use strict";
(function () {
  const searchKeyword = document.getElementById("search");
  const suggestionsContainer = document.getElementById("card-container");
  const favMoviesContainer = document.getElementById("fav-movies-container");
  const emptyText = document.getElementById("empty-search-text");
  const showFavourites = document.getElementById("favorites-section");
  const emptyFavText = document.getElementById("empty-fav-text");
  const searchBtn = document.getElementById("search-btn");

  const OPENAI_API_KEY = ' '; // Replace with your OpenAI API key
  const OMDB_API_KEY = '5c0359bc'; // Your existing OMDB API key

  addToFavDOM();
  showEmptyText();
  let suggestionList = [];
  let favMovieArray = [];

if (!firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();


// Add event listener for logout button
document.addEventListener('DOMContentLoaded', function() {
  addToFavDOM();
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
  }
  
});

// Logout function
async function handleLogout() {
  try {
      await auth.signOut();
      // Clear any user data from localStorage
      localStorage.removeItem('currentUser');

      // Redirect to login page
      window.location.href = 'login.html';
  } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
  }
}

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (!user) {
      // If no user is signed in, redirect to login page
      if (!window.location.pathname.includes('login.html')) {
          window.location.href = 'login.html';
      }
  } else {
      // User is signed in
      
      const userDisplayName = user.email || 'Guest';
      
      // You can update UI elements here if needed
      console.log('Logged in as:', userDisplayName);
      displayTrendingMovies();
      displayNowMovies();
  }
});

// Function to check if user is logged in
function isUserLoggedIn() {
  return auth.currentUser !== null;
}
  


const favoritesSection = document.getElementById("favorites-section");
const showFavouritesBtn = document.getElementById("show-favourites");
      // Initialize on page load
      document.addEventListener('DOMContentLoaded', function() {
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (!currentUser) {
              window.location.href = 'login.html';
          }

          // Handle search input
          const searchInput = document.getElementById('search');
          const suggestionsContainer = document.getElementById('Suggestions-container');
          const movieSections = document.querySelectorAll('.movie-section');

          searchInput.addEventListener('input', function() {
              if (this.value.trim() !== '') {
                  suggestionsContainer.style.display = 'block';
                  movieSections.forEach(section => section.style.display = 'none');
              } else {
                  suggestionsContainer.style.display = 'none';
                  movieSections.forEach(section => section.style.display = 'block');
              }
          });

          const favoritesSection = document.getElementById("favorites-section");
  const showFavouritesBtn = document.getElementById("show-favourites");
  let isFavoritesOpen = false;

  // Add click handler for favorites toggle
  showFavouritesBtn.addEventListener('click', function() {
      if (!isFavoritesOpen) {
          // Open favorites
          favoritesSection.style.display = "block";
          favoritesSection.classList.remove("animate__slideOutRight");
          favoritesSection.classList.add("animate__animated", "animate__slideInRight");
          showFavouritesBtn.style.color = "#FFD700";
          isFavoritesOpen = true;
      } else {
          // Close favorites
          favoritesSection.classList.remove("animate__slideInRight");
          favoritesSection.classList.add("animate__slideOutRight");
          showFavouritesBtn.style.color = "#8b9595";
          
          setTimeout(() => {
              favoritesSection.style.display = "none";
              favoritesSection.classList.remove("animate__slideOutRight");
          }, 300);
          
          isFavoritesOpen = false;
      }
  });
});
// showFavouritesBtn.addEventListener('click', function() {
//   if (!isFavoritesOpen) {
//       // Open favorites
//       favoritesSection.style.display = "block";
//       favoritesSection.classList.remove("animate__slideOutRight");
//       favoritesSection.classList.add("animate__animated", "animate__slideInRight");
//       showFavouritesBtn.style.color = "#FFD700";
//       document.getElementById('main-section').classList.add('with-favorites');
//       isFavoritesOpen = true;
//   } else {
//       // Close favorites
//       favoritesSection.classList.remove("animate__slideInRight");
//       favoritesSection.classList.add("animate__slideOutRight");
//       showFavouritesBtn.style.color = "#8b9595";
//       document.getElementById('main-section').classList.remove('with-favorites');
      
//       setTimeout(() => {
//           favoritesSection.style.display = "none";
//           favoritesSection.classList.remove("animate__slideOutRight");
//       }, 300);
      
//       isFavoritesOpen = false;
//   }
// });
  searchBtn.addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent form submission reload
    await handleSearch();
  });
  
  // Event listener for Enter key
  searchKeyword.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSearch();
    }
  });

  function showEmptyText() {
    if (favMoviesContainer.innerHTML == "") {
      emptyFavText.style.display = "block";
    } else {
      emptyFavText.style.display = "none";
    }
  }
  async function handleSearch() {
    const search = searchKeyword.value.trim();
    if (search === "") {
      emptyText.style.display = "block";
      suggestionsContainer.innerHTML = "";
      suggestionList = [];
    } else {
      emptyText.style.display = "none";
  
      try {
        // First get movie suggestions from OpenAI
        const movieTitles = await getMovieSuggestionsFromAI(search);
        console.log(movieTitles); 
        const moviecleaned=movieTitles.map(movie => movie.replace(/^\d+\.\s*/, ''));
        // const moviecleaned = movieTitles.map(movie => movie.replace(/^\d+\.\s*|\n/g, '').trim());
        // Clear previous results
        suggestionsContainer.innerHTML = "";
        suggestionList = [];
  
        // Fetch details for each suggested movie from OMDB
        for (const title of moviecleaned) {
          const movieData = await fetchMovies(title);
          if (movieData.Response === "True") {
            addToSuggestionContainerDOM(movieData);
          }
        }
        suggestionsContainer.style.display = "grid";
      } catch (error) {
        console.error('Error in search process:', error);
      }
    }
  }

// Function to create a movie card element
function createMovieCard(movie, favorites) {
  const movieCard = document.createElement('div');
  movieCard.className = 'movie-card';

  // Check if the movie is in the favorites
  const index = favorites.findIndex(data => movie.Title === data.Title);
  const isFavorite = index !== -1; // Determine if the movie is already a favorite

  movieCard.innerHTML = `
      <a href="movie.html" data-id="${movie.Title}">
        <img src="${movie.Poster}" 
             alt="${movie.Title}" 
             class="movie-poster"
             data-id="${movie.Title}" />
        <div class="movie-info">
            <h3 class="movie-title">
              <a href="movie.html" data-id="${movie.Title}">${movie.Title}</a>
            </h3>
            <div class="movie-rating">
                <span class="star-rating">
                    <i class="fa-solid fa-star"></i> ${movie.imdbRating}/10
                </span>
                <button class="fav-btn">
                    <i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart" 
                       data-id="${movie.Title}"
                       style="color: ${isFavorite ? 'red' : 'inherit'}">
                    </i>
                </button>
            </div>
        </div>
      </a>
  `;

  // Add click event listener to the favorite button
  const favBtn = movieCard.querySelector('.fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the anchor tag from redirecting
    handleFavforfriends(movie);

    // Toggle favorite state dynamically
    const heartIcon = favBtn.querySelector('i');
    if (heartIcon.classList.contains('fa-solid')) {
      heartIcon.classList.replace('fa-solid', 'fa-regular');
      heartIcon.style.color = 'inherit';
    } else {
      heartIcon.classList.replace('fa-regular', 'fa-solid');
      heartIcon.style.color = 'red';
    }
  });

  return movieCard;
}


async function handleFavforfriends(data) {
  const user = auth.currentUser;
  if(user){
    const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      let favorites = userData.favorites || [];
      
      // Check if movie is already in favorites
      const index = favorites.findIndex(movie => movie.Title === data.Title);
      
      if (index === -1) {
          // Add to favorites
          favorites.push(data);
      } 
      // else {
      //     // Remove from favorites
      //     favorites.splice(index, 1);
      // }

      // Update Firestore
      await db.collection('users').doc(user.uid).update({
          favorites: favorites
      });

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      currentUser.favorites = favorites;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  addToFavDOM();
}



async function displayTrendingMovies() {
  try {
    const movieGrid = document.querySelector('.movie-grid');
    movieGrid.innerHTML = '<div class="loading">Loading trending movies...</div>';

    const user = auth.currentUser;
    if (!user) {
        movieGrid.innerHTML = '<div class="error">Please log in to see trending movies</div>';
        return;
    }

    // Get user's friends
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    let MyFav = userData.favorites || [];
    const friendIds = userData.friends || [];

    // Get favorites from all friends
    const allFavorites = [];
    for (const friendId of friendIds) {
        const friendDoc = await db.collection('users').doc(friendId).get();
        const friendData = friendDoc.data();
        const favorites = friendData.favorites || [];
        allFavorites.push(...favorites);
    }

    // Count occurrences of each movie
    const movieCounts = {};
    allFavorites.forEach(movie => {
        const movieTitle = movie.Title;
        movieCounts[movieTitle] = (movieCounts[movieTitle] || 0) + 1;
    });

    // Sort by frequency and get top 5
    const topMovies = Object.entries(movieCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([title]) => {
            return allFavorites.find(movie => movie.Title === title);
        });

    // Clear loading message
    movieGrid.innerHTML = '';

    // Create and append movie cards
    topMovies.forEach(movie => {
        if (movie) {
            
            const movieCard = createMovieCard(movie,MyFav);
            movieGrid.appendChild(movieCard);
        }
    });

    // If no movies found
    if (topMovies.length === 0) {
        movieGrid.innerHTML = '<div class="no-movies">No trending movies among friends</div>';
    }

} catch (error) {
    console.error('Error fetching trending movies:', error);
    const movieGrid = document.querySelector('.movie-grid');
    movieGrid.innerHTML = '<div class="error">Error loading trending movies</div>';
}
}

async function displayNowMovies() {
  try {
    const movieGrid = document.querySelector('.movie-now');
    movieGrid.innerHTML = '<div class="loading">Loading Watching movies...</div>';

    const user = auth.currentUser;
    if (!user) {
        movieGrid.innerHTML = '<div class="error">Please log in to see Watching movies</div>';
        return;
    }

    // Get user's friends
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    let MyFav = userData.favorites || [];
    const friendIds = userData.friends || [];

    // Get favorites from all friends
    const allFavorites = [];
    for (const friendId of friendIds) {
        const friendDoc = await db.collection('users').doc(friendId).get();
        const friendData = friendDoc.data();
        const favorites = friendData.watchlist || [];
        allFavorites.push(...favorites);
    }

    // Count occurrences of each movie
    const movieCounts = {};
    allFavorites.forEach(movie => {
        const movieTitle = movie.Title;
        movieCounts[movieTitle] = (movieCounts[movieTitle] || 0) + 1;
    });

    // Sort by frequency and get top 5
    const topMovies = Object.entries(movieCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([title]) => {
            return allFavorites.find(movie => movie.Title === title);
        });

    // Clear loading message
    movieGrid.innerHTML = '';

    // Create and append movie cards
    topMovies.forEach(movie => {
        if (movie) {
            const movieCard = createMovieCard(movie,MyFav);
            movieGrid.appendChild(movieCard);
        }
    });

    // If no movies found
    if (topMovies.length === 0) {
        movieGrid.innerHTML = '<div class="no-movies">No now watching movies among friends</div>';
    }

} catch (error) {
    console.error('Error fetching trending movies:', error);
    const movieGrid = document.querySelector('.movie-now');
    movieGrid.innerHTML = '<div class="error">Error loading now watching movies</div>';
}
}




  // Function to get movie suggestions from OpenAI
  async function getMovieSuggestionsFromAI(searchQuery) {
    const prompt = `Suggest 5 movie titles related to "${searchQuery}".can you please stick to movies already existing and do not make up names.Only return the titles separated by commas and everything in the same line and do not give numbers, nothing else. `;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      const data = await response.json();
      const movieTitles = data.choices[0].message.content.split(',').map(title => title.trim());
      return movieTitles;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  }

  // Fetches data from OMDB api
  async function fetchMovies(search) {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(search)}&apikey=${OMDB_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      return data;
    } catch (err) {
      console.error('Error fetching from OMDB:', err);
      return null;
    }
  }

  // Shows in suggestion container DOM
  function addToSuggestionContainerDOM(data) {
    document.getElementById("empty-fav-text").style.display = "none";
    let isPresent = false;

    suggestionList.forEach((movie) => {
      if (movie.Title == data.Title) {
        isPresent = true;
      }
    });

    if (!isPresent && data.Title != undefined) {
      if (data.Poster == "N/A") {
        data.Poster = "./images/not-found.png";
      }
      suggestionList.push(data);
      const movieCard = document.createElement("div");
      movieCard.setAttribute("class", "text-decoration");

      movieCard.innerHTML = `
        <div class="movie-card my-2" data-id="${data.Title}">
        <a href="movie.html">
          <img
            src="${data.Poster}"
            class="card-img-top"
            alt="..."
            data-id="${data.Title}"
          />
          <div class="card-body text-start">
            <h5 class="card-title">
              <a href="movie.html" data-id="${data.Title}">${data.Title}</a>
            </h5>

            <p class="card-text">
              <i class="fa-solid fa-star">
                <span id="rating">&nbsp;${data.imdbRating}</span>
              </i>

              <button class="fav-btn">
                <i class="fa-solid fa-heart add-fav" data-id="${data.Title}"></i>
              </button>
            </p>
          </div>
        </a>
      </div>
    `;
      suggestionsContainer.prepend(movieCard);
    }
  }

  // Add to favourite of localStorage
  async function handleFavBtn(e) {
    const target = e.target;
    let data = await fetchMovies(target.dataset.id);
    const user = auth.currentUser;
    if(user){
      const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        let favorites = userData.favorites || [];
        
        // Check if movie is already in favorites
        const index = favorites.findIndex(movie => movie.Title === data.Title);
        
        if (index === -1) {
            // Add to favorites
            favorites.push(data);
        } 
        // else {
        //     // Remove from favorites
        //     favorites.splice(index, 1);
        // }

        // Update Firestore
        await db.collection('users').doc(user.uid).update({
            favorites: favorites
        });

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.favorites = favorites;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    addToFavDOM();
  }

  // Add to favourite list DOM
  function addToFavDOM() {
    favMoviesContainer.innerHTML = "";

    let favListj = JSON.parse(localStorage.getItem("currentUser"));
    let favList = favListj.favorites;
    if (favList) {
      favList.forEach((movie) => {
        const div = document.createElement("div");
        div.classList.add("fav-movie-card");
        div.innerHTML = `
          <img
            src="${movie.Poster}"
            alt="${movie.Title}"
            class="fav-movie-poster"
          />
          <div class="movie-card-details">
            <p class="movie-name">
              <a href="movie.html" class="fav-movie-name" data-id="${movie.Title}">${movie.Title}</a> 
            </p>
            <small class="text-muted">${movie.Year}</small>
          </div>
          <div class="delete-btn">
            <i class="fa-solid fa-trash-can" data-id="${movie.Title}"></i>
          </div>
        `;

        favMoviesContainer.prepend(div);
      });
    }
  }


  // To notify
  function notify(text) {
    window.alert(text);
  }

  // Delete from favourite list
  async function deleteMovie(name) {
    const user = auth.currentUser;
    if(user){
      const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        let favorites = userData.favorites || [];
        
        // Check if movie is already in favorites
        const index = favorites.findIndex(movie => movie.Title === name);
        
        if (index != -1) {
            // Add to favorites
            // favorites.push(data);
            favorites.splice(index, 1);
        } 
        // Update Firestore
        await db.collection('users').doc(user.uid).update({
            favorites: favorites
        });

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.favorites = favorites;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    addToFavDOM();
    showEmptyText();
  }

  // Handles click events
  async function handleClickListner(e) {
    const target = e.target;

    if (target.classList.contains("add-fav")) {
      e.preventDefault();
      handleFavBtn(e);
    } else if (target.classList.contains("fa-trash-can")) {
      deleteMovie(target.dataset.id);
    } else if (target.classList.contains("fa-bars")) {
      if (showFavourites.style.display == "flex") {
        document.getElementById("show-favourites").style.color = "#8b9595";
        showFavourites.style.display = "none";
      } else {
        showFavourites.classList.add("animate__backInRight");
        document.getElementById("show-favourites").style.color = "var(--logo-color)";
        showFavourites.style.display = "flex";
      }
    }

    localStorage.setItem("movieName", target.dataset.id);
  }

  // Event listener on whole document
  document.addEventListener("click", handleClickListner);
})();
