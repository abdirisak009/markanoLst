-- ====================================================
-- Agreement: Somali & Arabic content (3 languages)
-- ====================================================
-- content_html = English (existing), content_html_so = Somali, content_html_ar = Arabic.
-- Seeds v1.0 with Somali and Arabic so they display without relying on frontend fallback.
-- ====================================================

ALTER TABLE instructor_agreement_versions
  ADD COLUMN IF NOT EXISTS content_html_so TEXT DEFAULT NULL;

ALTER TABLE instructor_agreement_versions
  ADD COLUMN IF NOT EXISTS content_html_ar TEXT DEFAULT NULL;

COMMENT ON COLUMN instructor_agreement_versions.content_html_so IS 'Agreement content HTML (Somali).';
COMMENT ON COLUMN instructor_agreement_versions.content_html_ar IS 'Agreement content HTML (Arabic).';

-- Seed Somali and Arabic for version 1.0 (fix: so Somali & Arabic show from DB)
UPDATE instructor_agreement_versions
SET
  content_html_so = '<h2 class="text-xl font-semibold text-slate-900 mt-4 first:mt-0">Heerka Macalinka (Instructor Agreement)</h2>
<p class="text-slate-600 mt-2">Markaad ansixiso heerkan, waxaad ogolaatay shuruudaha soo socda ee ku aadan ka-qaybgalkaaga macalinka platform-kan.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">1. Qaybta Dakhliga (Revenue Share)</h3>
<p class="text-slate-600 mt-1">Boqolkiiba dakhligaaga platform-ku wuu gooni uga dhigi doonaa wuxuuna kugu soo gudbin doonaa. Lacag bixinta waxaa loo fulinayaa sida siyaabadda bixinta.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">2. Nuxurka & Dabeecada</h3>
<p class="text-slate-600 mt-1">Waad mas''uul ka tahay saxnaanta iyo tayada nuxurka koorsaskaaga. Waxaad ogolaatay inaadan daabicin wax been ah, xad gudub ah, ama aan habboonayn.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">3. Hantida Maskaxda</h3>
<p class="text-slate-600 mt-1">Waxaad hayso milkiyadda nuxurkaaga asaliga ah. Waxaad platform-ka siisaa ogolaansho adag oo caalami ah inuu kuu hoydiyo, tusiyo oo ardayda diiwaangeliyay u qaybiyo nuxurkaaga.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">4. Cusboonaysiinta</h3>
<p class="text-slate-600 mt-1">Marka heerka la cusboonaysiiyo, waxaa laga yaabaa in laguu qasdo inaad mar kale ansixiso. Waxaa laguu ogeysiin doonaa, waxaana laguu qasdii doonaa inaad ansixiso ka hor intaadan sii daabicin ama lacag ku sameyn.</p>
<p class="text-slate-700 font-medium mt-4"><strong>Markaad taabato "Ansixi & Sii wad" waxaad xaqiijinaysaa inaad akhriyay oo aad ogolaatay Heerka Macalinka.</strong></p>',
  content_html_ar = '<h2 class="text-xl font-semibold text-slate-900 mt-4 first:mt-0">اتفاقية المدرب</h2>
<p class="text-slate-600 mt-2">بقبولك لهذه الاتفاقية، فإنك توافق على الشروط التالية التي تحكم مشاركتك كمدرب على هذه المنصة.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">١. حصة الإيرادات</h3>
<p class="text-slate-600 mt-1">سيتم تحديد نسبة حصتك من الإيرادات من قبل المنصة وإبلاغك بها. تتم معالجة المدفوعات وفقاً لسياسة الدفع.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">٢. المحتوى والسلوك</h3>
<p class="text-slate-600 mt-1">أنت مسؤول عن دقة وجودة محتوى دورتك. توافق على عدم نشر مواد مضللة أو منتهكة أو غير مناسبة.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">٣. الملكية الفكرية</h3>
<p class="text-slate-600 mt-1">تحتفظ بملكية محتواك الأصلي. تمنح المنصة ترخيصاً غير حصري عالمياً لاستضافة وعرض وتوزيع محتواك على الطلاب المسجلين.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">٤. التحديثات</h3>
<p class="text-slate-600 mt-1">عند تحديث الاتفاقية، قد يُطلب منك إعادة القبول. سيتم إخطارك ويجب عليك القبول قبل المتابعة في النشر أو تحقيق الدخل.</p>
<p class="text-slate-700 font-medium mt-4"><strong>بالنقر على "قبول ومتابعة" فإنك تؤكد أنك قرأت ووافقت على اتفاقية المدرب هذه.</strong></p>',
  updated_at = NOW()
WHERE version = '1.0';
