import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
export const dynamic="force-dynamic";
export async function GET(request:Request){const raw=new URL(request.url).searchParams.get("slugs")||"";const wanted=raw.split(",").filter(s=>/^[a-z0-9][a-z0-9-]{1,79}$/.test(s)).slice(0,3);const tools=(await getPublicPdfTools()).filter(t=>wanted.includes(t.slug)).map(t=>({slug:t.slug,name:t.name}));return Response.json({tools},{headers:{"Cache-Control":"no-store"}});}

