import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
let searchQuery = '';
let page = 1;
let lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', onSearch);
loadMoreButton.addEventListener('click', onLoadMore);

async function fetchImages(query, page) {
  const API_KEY = '45861214-76b95c96ea530b9f2dd96e8b0';
  const BASE_URL = 'https://pixabay.com/api/';
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function onSearch(event) {
  event.preventDefault();
  searchQuery = event.target.searchQuery.value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.failure('Please enter a search term.');
    return;
  }

  page = 1;
  gallery.innerHTML = ''; // Golește galeria pentru noi rezultate
  loadMoreButton.style.display = 'none';

  fetchImages(searchQuery, page).then(data => {
    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, no images found. Please try again.');
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      renderImages(data.hits);
      lightbox.refresh();
      if (data.totalHits > 40) {
        loadMoreButton.style.display = 'block';
      }
    }
  });
}

function renderImages(images) {
  const markup = images
    .map(image => {
      return `
        <div class="photo-card">
          <a href="${image.largeImageURL}">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item"><b>Likes</b> ${image.likes}</p>
            <p class="info-item"><b>Views</b> ${image.views}</p>
            <p class="info-item"><b>Comments</b> ${image.comments}</p>
            <p class="info-item"><b>Downloads</b> ${image.downloads}</p>
          </div>
        </div>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function onLoadMore() {
  page += 1;
  fetchImages(searchQuery, page).then(data => {
    renderImages(data.hits);
    lightbox.refresh();

    if (page * 40 >= data.totalHits) {
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    scrollPage();
  });
}

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
