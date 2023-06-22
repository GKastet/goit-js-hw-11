import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css"
import axios from 'axios';


const BASE_URL = `https://pixabay.com/api/`;
const API_KEY = `?key=37603815-98520903b63fc1ffa2ecf35bf`;
const END_image_type = `&image_type=photo`;
const END_orientation = `&orientation=horizontal`;
const END_safesearch = `&safesearch=true`;

const refs = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('[name="searchQuery"]'),
    gallery: document.querySelector('.gallery'),
    ulList: document.querySelector('.list-ul'),
    btnLoadmore: document.querySelector('.load-more')
}

let page = 1;
const per_page = 40;
let hitsSum = 0;

refs.form.addEventListener('submit', handlerOnFormSubmit);
refs.btnLoadmore.addEventListener('click', handlerOnLoadmore);

async function handlerOnFormSubmit(evt){
    evt.preventDefault();
    try {
        const localValue = JSON.stringify(refs.input.value);
        localStorage.setItem('key', localValue)

        const results = await galleryDemand(page, per_page);
        console.log(results.totalHits);
        if(results.totalHits >= per_page){                    
            refs.btnLoadmore.classList.remove('hide') 
        }
        const arrResults = await results.hits;
        
        if(arrResults.length === 0){
            Notiflix.Report.failure('Wow!', 'Sorry, there are no images matching your search query. Please try again.');    
        }
        Notiflix.Notify.success(`'Hooray! We found ${results.totalHits} images.'`);
        const markUp = createMarkup(arrResults);        
        refs.gallery.innerHTML = markUp;
        lightbox.refresh()
        page = 1;
        hitsSum +=per_page;
                
        refs.form.reset();
    } catch (error) {
        Notiflix.Notify.failure('Sorry, server is overloaded. Please try later.');
        console.log('error:', error);
    }
}

async function handlerOnLoadmore(){
    page +=1;    
    const nextPage = await galleryDemand(page, per_page);    
    if(hitsSum >= nextPage.totalHits - per_page){
        console.log('STOP!!!');
        Notiflix.Notify.failure(`We're sorry, but you've reached the end of search results.`);
        refs.btnLoadmore.classList.add('hide');        
    }  
    const arrNextPage = await nextPage.hits;     
    const nextMarkup = createMarkup(arrNextPage);
    refs.gallery.insertAdjacentHTML('beforeend', nextMarkup);
    lightbox.refresh()
    hitsSum +=per_page;
    const { height: cardHeight } = document.querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 1,
  behavior: "smooth",
});
}

function galleryDemand(page = 1, per_page){
    const getLocalValue = localStorage.getItem('key');
    const readyLocalValue = JSON.parse(getLocalValue);  
    const querySmall = readyLocalValue.toLowerCase();
    const END_q = `&q=${querySmall}`;
    const URL = BASE_URL + API_KEY + END_q + END_image_type + END_orientation + END_safesearch + `&page=${page}` + `&per_page=${per_page}`;    
    return axios.get(URL).then((responce)=>{        
        if(!responce.status === 200){
            throw new Error();
        }
        return responce.data;
    })    
}


function createMarkup(arr){
    return arr.map(({webformatURL, largeImageURL, likes, views, comments, downloads, tags})=>{
        return `
                    <a href="${largeImageURL}" class="link">
                        <div class="img-container">
                        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                        </div>
                        <div class="info">
                            <p class="info-item">
                                <b>Likes</b><span>${likes}</span>
                            </p>
                            <p class="info-item">
                                <b>Views</b><span>${views}</span>
                            </p>
                            <p class="info-item">
                                <b>Comments</b><span>${comments}</span>
                            </p>
                            <p class="info-item">
                                <b>Downloads</b><span>${downloads}</span>
                            </p>
                        </div>
                    </a>`
    }).join('');
        
}

const lightbox = new SimpleLightbox('.gallery a', {
    navText: ['<','>'],
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
});