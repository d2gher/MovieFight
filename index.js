// Configuration for the auto complete widget
const autoCompleteConfig = {
    // What we show when the user searches for something
    showOption(movie) {
        // Check if the api returned a poster image, if not, use defult on
        const posterSRC = movie.Poster === 'N/A' ? "https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png" : movie.Poster;
        return `
            <img src="${posterSRC}"/>
            ${movie.Title} (${movie.Year})
        `
    }, 
    // To update the search bar with the name of the movie the user clicks on
    inputValue(movie) {
        return movie.Title;
    }, 
    // Make a search request to the api, and get a bunch of movies
    async fetchData (searchTerm) {
        const response = await axios.get("http://www.omdbapi.com/", {
            params: {
                apikey: "512c3e5a",
                    s: searchTerm
                }
        });
        
        // Return an empty array if there are no movies found
        if (response.data.Error) { return [] };
        // Other ways, return the search results
        return response.data.Search;
    }
}

// Create the left auto Complete widget, using function found in our autocompelete.js file
createAutoComplete({
    // Destructure the function found in autoCompeleteConfig object
    ...autoCompleteConfig,
    // Set Where our new HTML shoud go
    root: document.querySelector("#left-autocomplete"),
    // When the user chooses a movie
    onOptionSelect(movie) {
        // Hide the tutorial
        document.querySelector(".tutorial").classList.add("is-hidden"); 
        // Make a follow up request to get more data about the movie
        getMovieInfo(movie, document.querySelector("#left-summry"), "left");
    }
});

// Create the right auto Complete widget
createAutoComplete({
    // Destructure the function found in autoCompeleteConfig object
    ...autoCompleteConfig,
    // Set Where our new HTML shoud go
    root: document.querySelector("#right-autocomplete"),
    // When the user chooses a movie
    onOptionSelect(movie) {
        // Hide tutorial
        document.querySelector(".tutorial").classList.add("is-hidden"); 
        // Make a follow up request to get more data about the movie
        getMovieInfo(movie, document.querySelector("#right-summry"), "right");
    }
});


let leftMovie;
let rightMovie;
// Function to get data about specfic movie, then saving the data in a varible
const getMovieInfo = async (movie, summryTarget, side) =>  {
    const response = await axios.get("http://www.omdbapi.com/", {
        params: {
            apikey: "512c3e5a",
            i: movie.imdbID
        }
    });

    // Populate the summry with the information about the movie
    summryTarget.innerHTML= movieTemplate(response.data);

    // Save the data in our varibles
    if (side === "left") {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }

    // When the user picks two movies and the our two varibles have data, start the fight!
    if (rightMovie && leftMovie) {
        runComparison();
    }
};

// Function to compare the two movies selected by the user
const runComparison = () =>{
    // Select the parts the have the data about our movies in the HTML
    const LeftStates = document.querySelectorAll("#left-summry .notification");
    const rightStates = document.querySelectorAll("#right-summry .notification");
    
    // For each catagorie, compare the two 
    LeftStates.forEach((leftState, index) => {
        // Get the counterpart on the other side
        const rightState = rightStates[index];

        // Turn the strings into numbers
        const rightSideValue = parseFloat(rightState.dataset.value);
        const leftSideValue = parseFloat(leftState.dataset.value);

        // Remove any color for the lables the had before
        leftState.classList.remove("is-warning", "is-primary", "is-danger");
        rightState.classList.remove("is-warning", "is-primary", "is-danger");

        // compare the two, and mark the winner with green, the loser with red, and yellow for equalls
        if (rightSideValue < leftSideValue) {
            rightState.classList.add("is-danger");
            leftState.classList.add("is-primary");
        } else if ( rightSideValue > leftSideValue ) {
            rightState.classList.add("is-primary");
            leftState.classList.add("is-danger");
        } else {
            rightState.classList.add("is-warning");
            leftState.classList.add("is-warning");
        }
    }); 

}

// Movie template to add to the HTML
const movieTemplate = movieDetails => {
    // Turn our string data that we get form the api into numbers so we can compare them
    let dollors;
    if (movieDetails.BoxOffice) {
        dollors = parseInt(movieDetails.BoxOffice.replace(/\$/g, "").replace(/,/g, ""));
    } else { dollors = 0 } 

    const metascore = parseInt(movieDetails.Metascore);
    const imdbRating = parseFloat(movieDetails.imdbRating);
    const imdbVotes = parseInt(movieDetails.imdbVotes.replace(/,/g, ""));
    // Add all the numbers in the awards string together, by spliting the string
    // adding all the numbers and ignoring the rest
    const awards = movieDetails.Awards.split(" ").reduce((prev, word) =>{
        const value = parseInt(word);

        if (isNaN(value)) {
            return prev;
        } else {
            return prev + value;
        }
    }, 0);

    // popluate the HTML with the data we got
    return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetails.Poster}"/>
                </p>
            </figure>
            <div class="media-content">
                <div class="content">
                    <h1>${movieDetails.Title}</h1>
                    <h4>${movieDetails.Genre}</h4>
                    <p>${movieDetails.Plot}</p>
                </div>
            </div>
        </article>
        <article data-value=${awards} class="notification is-warning">
            <p class="title">${movieDetails.Awards}</p>
            <p class="subitle">Awards</p>
        </article>
        <article data-value=${dollors} class="notification is-warning">
            <p class="title">${movieDetails.BoxOffice}</p>
            <p class="subitle">Box Office</p>
        </article>
        <article data-value=${metascore} class="notification is-warning">
            <p class="title">${movieDetails.Metascore}</p>
            <p class="subitle">Metascore</p>
        </article>
        <article data-value=${imdbRating} class="notification is-warning">
            <p class="title">${movieDetails.imdbRating}</p>
            <p class="subitle">IMDB Rating</p>
        </article>
        <article data-value=${imdbVotes} class="notification is-warning">
            <p class="title">${movieDetails.imdbVotes}</p>
            <p class="subitle">IMDB Votes</p>
        </article>
    `
}