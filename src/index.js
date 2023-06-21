console.log(1);

import Notiflix from 'notiflix';
import axios from 'axios';

const BASE_URL = `https://pixabay.com/api/`;//search images
const API_KEY = `?key=37603815-98520903b63fc1ffa2ecf35bf`;//pixabay
const END_image_type = `&image_type=photo`;//photo
const END_orientation = `&orientation=horizontal`;//horizontal
const END_safesearch = `&safesearch=true`;//true

const refs = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('[name="searchQuery"]'),
    gallery: document.querySelector('.gallery'),
    ulList: document.querySelector('.list-ul'),
    btnLoadmore: document.querySelector('.load-more')
}

refs.btnLoadmore.hidden = true;
//refs.btnLoadmore.setAttribute('hidden', '');

let page = 1;
const per_page = 40;
let hitsSum = 0;
console.log(hitsSum);

refs.form.addEventListener('submit', handlerOnFormSubmit);
refs.btnLoadmore.addEventListener('click', handlerOnLoadmore);

async function handlerOnFormSubmit(evt){
    evt.preventDefault();
    try {
        const localValue = JSON.stringify(refs.input.value);
        localStorage.setItem('key', localValue)

        const results = await galleryDemand(page, per_page);
        const arrResults = await results.hits;
        //console.log(results);
        //console.log(arrResults);
        if(arrResults.length === 0){
            Notiflix.Report.failure('Wow!', 'Sorry, there are no images matching your search query. Please try again.');    
        }        
        const markUp = createMarkup(arrResults);        
        refs.gallery.innerHTML = markUp;
        page = 1;
        hitsSum +=per_page;
        console.log(hitsSum); 
        refs.btnLoadmore.hidden = false;
        //refs.btnLoadmore.removeAttribute('hidden')
        refs.form.reset();
    } catch (error) {
        Notiflix.Notify.failure('Sorry, server is overloaded. Please try later.');
        console.log('error:', error);
    }
}

async function handlerOnLoadmore(){
    page +=1;    
    const nextPage = await galleryDemand(page, per_page);
    //console.log(nextPage.totalHits);   
    if(hitsSum >= nextPage.totalHits - per_page){
        console.log('STOP!!!');
        Notiflix.Report.failure('Wow!', `We're sorry, but you've reached the end of search results.`);
        refs.btnLoadmore.hidden = true;        
    }  
    const arrNextPage = await nextPage.hits;     
    const nextMarkup = createMarkup(arrNextPage);
    refs.gallery.insertAdjacentHTML('beforeend', nextMarkup);
    hitsSum +=per_page;
    console.log(hitsSum);
}

function galleryDemand(page = 1, per_page){
    const getLocalValue = localStorage.getItem('key');
    const readyLocalValue = JSON.parse(getLocalValue);  
    const querySmall = readyLocalValue.toLowerCase();
    const END_q = `&q=${querySmall}`;
    const URL = BASE_URL + API_KEY + END_q + END_image_type + END_orientation + END_safesearch + `&page=${page}` + `&per_page=${per_page}`;    
    //console.log(URL);
    return fetch(URL).then((responce)=>{
        if(!responce.ok){
            throw new Error();
        }
        return responce.json();
    })        
    // const response = await fetch(URL);
    // const apiJson = await response.json()
    // const arrApi = apiJson.hits;
    // return arrApi
}


function createMarkup(arr){
    return arr.map(({webformatURL, largeImageURL, likes, views, comments, downloads, tags})=>{
        return `<div class="photo-card">
                    <a href="${largeImageURL}">
                        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                    </a>
                        <div class="info">
                            <p class="info-item">
                                <b>Likes ${likes}</b>
                            </p>
                            <p class="info-item">
                                <b>Views ${views}</b>
                            </p>
                            <p class="info-item">
                                <b>Comments ${comments}</b>
                            </p>
                            <p class="info-item">
                                <b>Downloads ${downloads}</b>
                            </p>
                        </div>
                </div>`
    }).join('');    
}