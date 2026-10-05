import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const loadMoreButton = document.querySelector('.load-more');

let query = '';
let page = 1;

form.addEventListener('submit', handleSubmit);
loadMoreButton.addEventListener('click', handleLoadMore);

async function handleSubmit(event) {
  event.preventDefault();

  const newQuery = event.target.elements['search-text'].value.trim();

  if (newQuery === '') {
    showError('Please enter a search query!');
    return;
  }

  query = newQuery;
  page = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();
  form.reset();

  try {
    const data = await getImagesByQuery(query, page);

    if (data.hits.length === 0) {
      showError(
        'Sorry, there are no images matching your search query. Please try again!'
      );
      return;
    }

    createGallery(data.hits);
    checkEndOfCollection(data.totalHits);
  } catch (error) {
    showError('Something went wrong. Please try again later!');
  } finally {
    hideLoader();
  }
}

async function handleLoadMore() {
  page += 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    createGallery(data.hits);
    scrollGallery();
    checkEndOfCollection(data.totalHits);
  } catch (error) {
    page -= 1;
    showLoadMoreButton();
    showError('Something went wrong. Please try again later!');
  } finally {
    hideLoader();
  }
}

function checkEndOfCollection(totalHits) {
  const totalPages = Math.ceil(totalHits / PER_PAGE);

  if (page >= totalPages) {
    hideLoadMoreButton();
    showInfo("We're sorry, but you've reached the end of search results.");
    return;
  }

  showLoadMoreButton();
}

function scrollGallery() {
  const card = document.querySelector('.gallery-item');
  const cardHeight = card.getBoundingClientRect().height;

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function showError(message) {
  iziToast.error({
    message,
    position: 'topRight',
    maxWidth: 432,
    theme: 'dark',
    backgroundColor: '#ef4040',
    messageColor: '#fff',
  });
}

function showInfo(message) {
  iziToast.info({
    message,
    position: 'topRight',
    maxWidth: 432,
    theme: 'dark',
    backgroundColor: '#4e75ff',
    messageColor: '#fff',
  });
}
