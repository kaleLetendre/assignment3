const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let checkedTypes = []
document.cookie = ' '
const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()
  if (currentPage == 1) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="1">1</button>
    `)
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="2">2</button>
    `)
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="3">3</button>
    `)
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage+1}">Next</button>
    `)
  } else if (currentPage == 2) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage-1}">Prev</button>
    `)
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="1">1</button>
    `)
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="2">2</button>
    `)
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="3">3</button>
    `)
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage+1}">Next</button>
    `)
  } else if (currentPage >=3  && currentPage <= numPages-2) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage-1}">Prev</button>
    `)
    for (let i = currentPage-2; i <= currentPage+2; i++) {
      $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
      `)
    }
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage+1}">Next</button>
    `)
  }
  else if (currentPage > numPages-2) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage-1}">Prev</button>
    `)
    for (let i = numPages-2; i <= numPages; i++) {
      $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
      `)
    }
  }

}


const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  $('#filter').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/type');
  let types = response.data.results;
  // check box for each type
  types.forEach((type) => {
    $('#filter').append(`
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${type.name}" id="${type.name}" onclick="setup(true,this.value)">
        <label class="form-check-label" for="${type.name}">${type.name}</label>
      </div>
    `)
    if (document.cookie.includes(type.name)) {
      $(`#${type.name}`).prop('checked', true)
    }
  })
  $('#ammount').empty()
  $('#ammount').append(`<h1>${(currentPage - 1) * PAGE_SIZE + 1} - ${currentPage * PAGE_SIZE} of ${pokemons.length}</h1>`)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}

const setup = async (filtering,type) => {

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  tempPokemons = response.data.results;
  let pokemons = []
  if (filtering) {
    if (document.cookie.includes(type)) {
      // remove type from cookie
      document.cookie = document.cookie.replace(type, '')
      console.log(document.cookie+ " " + document.cookie.length)
      if (document.cookie.length == 1) {
        return setup(false)
      }
      return setup(true)
    }
    else {
      document.cookie += type
    }
    tempPokemons.forEach((pokemon) => {
      // check the type of each pokemon
      axios.get(pokemon.url).then((res) => {
        let types = res.data.types.map((type) => type.type.name)
        // console.log("types: ", types);
        let flag = false
        types.forEach((type) => {
          if (document.cookie.includes(type)) {
            flag = true
          }
        })
        if (flag) {
          pokemons.push(pokemon)
        }
      })
    })
  } else {
    pokemons = tempPokemons
  }


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

}


$(document).ready(setup(false))

// visit this : https://pokeapi.co/api/v2/pokemon?limit=810
//perform api call to get all pokemon names and urls