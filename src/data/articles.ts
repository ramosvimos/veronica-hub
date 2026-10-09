import voice from './articles/voice.json';
import askpdf from './articles/askpdf.json';
import deepseek from './articles/deepseek.json';
import transcript from './articles/transcript.json';
import random from './articles/random.json';
export type GuideArticle = {slug:string;projectSlug:string;title:string;seoTitle:string;description:string;excerpt:string;date:string;answer:string;sections:{heading:string;paragraphs:string[];steps?:string[]}[];conclusion:string;faq:{question:string;answer:string}[];sources:{label:string;url:string}[];tags:string[]};
export const articles:GuideArticle[]=[...deepseek,...voice,...transcript,...askpdf,...random];
export function getArticle(slug:string){return articles.find(a=>a.slug===slug);}
export function getProjectArticles(projectSlug:string){return articles.filter(a=>a.projectSlug===projectSlug);}
