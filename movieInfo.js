"use strict";
(function () {
  const title = document.getElementById("title");
  title.innerHTML = localStorage.getItem("movieName");
  const year = document.getElementById("year");
  const runtime = document.getElementById("runtime");
  const rating = document.getElementById("rating");
  const poster = document.getElementById("poster");
  const plot = document.getElementById("plot");
  const directorsName = document.getElementById("director-names");
  const castName = document.getElementById("cast-names");
  const genre = document.getElementById("genre");

  fetchMovies(title.innerHTML);
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
const db = firebase.firestore();

  document.getElementById('watchingBtn').addEventListener('click', function() {
    const movieName = document.getElementById('title').textContent;
    const button = this;
    if (button.classList.contains('btn-outline-primary')) {
        // Change to active state
        fetchMoviesandpush(movieName);
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-primary');

    } else {
        // Change back to inactive state
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-primary');
    }
});

async function fetchMoviesandpush(search) {
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(search)}&apikey=5c0359bc`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const user = auth.currentUser;
    let watchlist=[];
        watchlist.push(data);
        await db.collection('users').doc(user.uid).update({
          watchlist:watchlist
      });
  } catch (err) {
    console.error('Error fetching from OMDB:', err);
    return null;
  }
}
  async function fetchMovies(search) {
    const url = `https://www.omdbapi.com/?t=${search}&type=movie&apikey=5c0359bc`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      year.innerHTML = data.Year;
      runtime.innerHTML = data.Runtime;
      rating.innerHTML = `${data.imdbRating}/10`;
      poster.setAttribute("src", `${data.Poster}`);
      plot.innerHTML = data.Plot;
      directorsName.innerHTML = data.Director;
      castName.innerHTML = data.Actors;
      genre.innerHTML = data.Genre;
    } catch (err) {
      console.log(err);
    }
  }
})();
