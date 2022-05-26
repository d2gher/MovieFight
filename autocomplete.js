const createAutoComplete = ({ root, showOption, onOptionSelect, inputValue, fetchData }) => {
    // Add the dropdown menu HTLM
    root.innerHTML = `
        <lable><b>Search</b></lable>
        <input class="input"/>
        <div class="dropdown">
            <div class="dropdown-menu">
                <div class="dropdown-content results">

                </div>
            </div>
        </div>
    `;

    // Get the HTML elements we will play with
    const input = root.querySelector('input');
    const dropdown = root.querySelector('.dropdown');
    const resultsWrapper = root.querySelector('.results');

    // Send a search request to the API when the user types something in the search bar
    const onInput = debounce(async event => {
        const items = await fetchData(event.target.value);

        // If the results array is empty, do nothing
        if (!items.length) {
            dropdown.classList.remove('is-active');
            return;
        }

        // Empty the dropdown menu of previous results
        resultsWrapper.innerHTML = "";
        // Popluate the dropdown menu with the new results
        for (let item of items) {
            const option = document.createElement('a');
            
            dropdown.classList.add("is-active");
            option.classList.add("dropdown-item");
            option.innerHTML = showOption(item);

            // When the user clicks on a movie, update the name in the search bar to the exact name 
            // and close the dropdown menu
            option.addEventListener('click', event => {
                dropdown.classList.remove('is-active');
                input.value = inputValue(item);
                onOptionSelect(item);
            });
            resultsWrapper.appendChild(option);
        }
    }, 1000)

    // Listen to when the user types something in the seach bar
    input.addEventListener('input', onInput);

    // Close the dropdown menu when the user clicks outside it
    document.addEventListener('click', event => {
        if (!root.contains(event.target)) {
            dropdown.classList.remove('is-active');
        }
    });
}