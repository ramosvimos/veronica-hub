import { describe,it,expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Terms from '@/app/(website)/(public)/terms/page';
import Privacy from '@/app/(website)/(public)/privacy/page';
import EditorialPolicy from '@/app/(website)/(public)/editorial-policy/page';
import { pdfToolExternalRel } from '@/lib/pdf-outbound-links';
describe('paid service disclosures',()=>{
 it('states approved service terms and distinguishes pending from completed refunds',()=>{const html=renderToStaticMarkup(<Terms/>);for(const text of ['USD $9.90','no required backlink','seven business days','Monday through Friday','UTC','full USD $9.90','refund pending','not a completed refund','not guaranteed acceptance'])expect(html).toContain(text);});
 it('explains provider billing and token boundaries',()=>{const html=renderToStaticMarkup(<Privacy/>);expect(html).toContain('Stripe');expect(html).toContain('do not collect or store card numbers');expect(html).toContain('tokens are not included in checkout URLs');expect(html).toContain('not included in the public tool catalogue');});
 it('does not promise paid placement and discloses sponsored links',()=>{const html=renderToStaticMarkup(<EditorialPolicy/>);expect(html).toContain('does not guarantee acceptance or placement');expect(html).toContain('sponsored outbound links');expect(pdfToolExternalRel({paidSubmission:true})).toContain('sponsored');expect(pdfToolExternalRel({reciprocalSubmission:true})).toContain('nofollow');});
});
