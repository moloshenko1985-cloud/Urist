import { ManagementCompany, OwnerProfile, SavedClaim } from '../types';

/**
 * Adds N business days (skipping Saturday and Sunday) to a date,
 * strictly following п. 36 Правил № 416 (10 рабочих дней).
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate.getTime());
  let added = 0;
  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return result;
}

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export function formatRussianDateLong(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = d.getDate();
  const month = MONTHS_GENITIVE[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year} г.`;
}

export function formatShortDateTime(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy}, ${hh}:${min}`;
}

export function formatFormalDate(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function getDeadlineStatus(deadlineIso: string): {
  label: string;
  isExpired: boolean;
  isUrgent: boolean;
  daysLeft: number;
} {
  const now = new Date();
  const deadline = new Date(deadlineIso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDeadline = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate()
  ).getTime();

  const diffDays = Math.ceil((startOfDeadline - startOfToday) / (1000 * 60 * 60 * 24));
  const formattedDeadline = formatRussianDateLong(deadline);

  if (diffDays < 0) {
    return {
      label: `Срок истек ${formattedDeadline} — можно подавать жалобу в ГЖИ`,
      isExpired: true,
      isUrgent: true,
      daysLeft: 0,
    };
  }
  if (diffDays === 0) {
    return {
      label: `Последний день ответа УК (${formattedDeadline})`,
      isExpired: false,
      isUrgent: true,
      daysLeft: 0,
    };
  }
  return {
    label: `Осталось около ${diffDays} дн. (до ${formattedDeadline})`,
    isExpired: false,
    isUrgent: diffDays <= 2,
    daysLeft: diffDays,
  };
}

export function buildOfficialClaimText(params: {
  profile: OwnerProfile;
  company: ManagementCompany;
  title: string;
  legalBasis: string;
  facts: string;
  demands: string[];
  date?: Date;
}): string {
  const { profile, company, legalBasis, facts, demands } = params;
  const docDate = params.date ?? new Date();

  const fullName = profile.fullName.trim() || '[Укажите ФИО собственника]';
  const address = profile.address.trim() || '[Укажите адрес дома]';
  const apartment = profile.apartment.trim() ? `, кв. ${profile.apartment.trim()}` : '';
  const phone = profile.phone.trim() || '[Укажите телефон]';
  const email = profile.email.trim() || '[Укажите Email]';

  const numberedDemands = demands.map((d, idx) => `${idx + 1}. ${d}`).join('\n');

  return `${company.directorLine}
Адрес: ${company.address}
Email: ${company.email}

От собственника: ${fullName}
Адрес: ${address}${apartment}
Телефон: ${phone}
Email для официального ответа: ${email}

ПРЕТЕНЗИЯ (ОФИЦИАЛЬНОЕ ОБРАЩЕНИЕ)

Я являюсь собственником жилого помещения по адресу: ${address}${apartment} (${company.complexName}). Управление указанным многоквартирным домом осуществляет ${company.name}.

${facts}

Правовое обоснование:
${legalBasis}

На основании изложенного, руководствуясь Жилищным кодексом РФ, Постановлением Правительства РФ № 354, № 491 и п. 36 Правил осуществления деятельности по управлению многоквартирными домами (утв. ПП РФ № 416),

ТРЕБУЮ:
${numberedDemands}
${demands.length + 1}. Направить письменный мотивированный ответ на настоящее обращение в установленный законом срок — не позднее 10 рабочих дней с момента получения (п. 36 Правил № 416) — на электронную почту ${email}.

В случае неудовлетворения указанных требований или нарушения срока ответа оставляю за собой право обратиться с жалобой в Инспекцию по жилищному надзору Республики Крым (ГЖИ РК), Прокуратуру и суд с отнесением на управляющую организацию всех судебных расходов и штрафа в размере 50% по п. 6 ст. 13 Закона РФ «О защите прав потребителей».`;
}

export function buildMailtoHref(companyEmail: string, subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${companyEmail}?subject=${encodedSubject}&body=${encodedBody}`;
}

/**
 * Generates and downloads an .ics calendar event file natively supported by iOS Calendar,
 * reminding the owner when the 10-business-day legal deadline expires.
 */
export function downloadIOSCalendarReminder(claim: SavedClaim): void {
  const deadline = new Date(claim.deadlineAt);
  const year = deadline.getFullYear();
  const month = String(deadline.getMonth() + 1).padStart(2, '0');
  const day = String(deadline.getDate()).padStart(2, '0');
  const dateStamp = `${year}${month}${day}`;

  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `Срок ответа УК: ${claim.title}`.replace(/[,;]/g, ' ');
  const description = `Истекает 10-дневный срок ответа ООО «ДУКК» по п. 36 Правил № 416. Если ответ не получен, можно подавать жалобу в ГЖИ РК.`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YuristVKarmany//JK Progress iOS//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${claim.id}@yurist-jk-progress`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dateStamp}`,
    `DTEND;VALUE=DATE:${dateStamp}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT9H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `srok-otveta-uk-${dateStamp}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Exports a clean GOST-formatted Microsoft Word (.doc) file
 * (Times New Roman 12pt, right-aligned header, centered title, justified body).
 */
export function downloadWordDocument(title: string, documentText: string): void {
  const blocks = documentText.split(/\n\n+/);
  const htmlBlocks = blocks.map((block, index) => {
    const trimmed = block.trim();
    const linesHtml = escapeHtml(trimmed).replace(/\n/g, '<br/>');

    // First two blocks are formal recipient & applicant header (right-aligned)
    if (index === 0 || index === 1) {
      return `<p style="margin:0 0 10pt 220pt;text-align:left;line-height:1.35;">${linesHtml}</p>`;
    }
    // Centered document heading
    if (
      trimmed.startsWith('ПРЕТЕНЗИЯ') ||
      trimmed.startsWith('ЖАЛОБА') ||
      trimmed === 'ТРЕБУЮ:' ||
      trimmed === 'ПРОШУ:'
    ) {
      return `<p style="margin:14pt 0 10pt 0;text-align:center;font-weight:bold;letter-spacing:0.3pt;">${linesHtml}</p>`;
    }
    return `<p style="margin:0 0 9pt 0;text-align:justify;text-indent:24pt;line-height:1.45;">${linesHtml}</p>`;
  });

  const docHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 20mm 15mm 20mm 25mm; }
    body { font-family: "Times New Roman", serif; font-size: 12pt; color: #000000; }
  </style>
</head>
<body>
${htmlBlocks.join('\n')}
</body>
</html>`;

  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const safeSlug = title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeSlug || 'pretenziya-uk'}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const GJI_RK_EMAIL = 'inspekciya@gizn.rk.gov.ru';
export const GJI_RK_ADDRESS = '295034, Республика Крым, г. Симферополь, ул. Киевская, д. 81';

/**
 * Generates a ready-to-send escalation complaint to GJI RK (Инспекция по жилищному надзору РК)
 * when the management company violates the 10-business-day response period or fails to resolve the issue.
 */
export function buildGjiEscalationClaim(
  claim: SavedClaim,
  profile: OwnerProfile,
  company: ManagementCompany
): { subject: string; body: string; email: string } {
  const fullName = profile.fullName.trim() || '[Укажите ФИО собственника]';
  const address = profile.address.trim() || '[Укажите адрес дома]';
  const apartment = profile.apartment.trim() ? `, кв. ${profile.apartment.trim()}` : '';
  const phone = profile.phone.trim() || '[Укажите телефон]';
  const email = profile.email.trim() || '[Укажите Email]';
  const sentDate = formatFormalDate(claim.createdAt);
  const deadlineDate = formatFormalDate(claim.deadlineAt);

  const subject = `Жалоба на бездействие ${company.name} (${company.complexName}): ${claim.title}`;
  const body = `В Инспекцию по жилищному надзору Республики Крым (ГЖИ РК)
Адрес: ${GJI_RK_ADDRESS}
Email: ${GJI_RK_EMAIL}

От собственника: ${fullName}
Адрес: ${address}${apartment}
Телефон: ${phone}
Email для официального ответа: ${email}

ЖАЛОБА
на нарушение лицензионных требований и бездействие управляющей организации ${company.name}

Я являюсь собственником жилого помещения по адресу: ${address}${apartment} (${company.complexName}). Управление указанным многоквартирным домом осуществляет ${company.name} (юридический адрес: ${company.address}, email: ${company.email}).

${sentDate} мною в адрес управляющей организации ${company.name} была направлена официальная претензия по вопросу: «${claim.title}». В соответствии с п. 36 Правил осуществления деятельности по управлению многоквартирными домами (утв. ПП РФ № 416) установленный законом 10-дневный срок (в рабочих днях) для направления мотивированного ответа истек ${deadlineDate}.

На момент подачи настоящей жалобы управляющая организация ${company.name} не устранила указанные нарушения и (или) не предоставила мотивированный ответ в установленный законом срок, чем грубо нарушила лицензионные требования (ч. 2.3 ст. 161 ЖК РФ, ПП РФ № 416, ПП РФ № 354, ПП РФ № 491).

На основании изложенного, руководствуясь ст. 20 ЖК РФ, Федеральным законом № 59-ФЗ «О порядке рассмотрения обращений граждан РФ» и ст. 7.23.3 КоАП РФ,

ПРОШУ:
1. Провести контрольно-надзорную проверку в отношении управляющей организации ${company.name} по факту изложенных нарушений и несоблюдения срока ответа на обращение собственника.
2. Выдать ${company.name} обязательное для исполнения предписание об устранении выявленных нарушений и проведении перерасчета (при наличии оснований).
3. Привлечь ${company.name} и ее должностных лиц к административной ответственности по ч. 2 ст. 14.1.3 КоАП РФ и (или) ст. 7.23.3 КоАП РФ.
4. Направить письменный ответ о результатах рассмотрения жалобы и принятых мерах на электронную почту ${email}.

Приложение: скриншот ранее направленной претензии в ${company.name} от ${sentDate} («${claim.title}») с подтверждением даты отправки.`;

  return { subject, body, email: GJI_RK_EMAIL };
}

export const PROSECUTOR_SIMFEROPOL_EMAIL = 'simfg01@rkproc.ru';
export const PROSECUTOR_SIMFEROPOL_ADDRESS =
  '295000, Республика Крым, г. Симферополь, ул. Горького, д. 15';

/**
 * Generates a formal escalation complaint to the Prosecutor's Office of Simferopol
 * citing Federal Law No. 2202-1 "On the Prosecutor's Office of the RF", 59-FZ, and KoAP RF.
 */
export function buildProsecutorEscalationClaim(
  claim: SavedClaim,
  profile: OwnerProfile,
  company: ManagementCompany
): { subject: string; body: string; email: string } {
  const fullName = profile.fullName.trim() || '[Укажите ФИО собственника]';
  const address = profile.address.trim() || '[Укажите адрес дома]';
  const apartment = profile.apartment.trim() ? `, кв. ${profile.apartment.trim()}` : '';
  const phone = profile.phone.trim() || '[Укажите телефон]';
  const email = profile.email.trim() || '[Укажите Email]';
  const sentDate = formatFormalDate(claim.createdAt);
  const deadlineDate = formatFormalDate(claim.deadlineAt);

  const subject = `Жалоба в Прокуратуру на нарушения ${company.name} (${company.complexName}): ${claim.title}`;
  const body = `В Прокуратуру города Симферополя Республики Крым
Адрес: ${PROSECUTOR_SIMFEROPOL_ADDRESS}
Email: ${PROSECUTOR_SIMFEROPOL_EMAIL}

От собственника: ${fullName}
Адрес: ${address}${apartment}
Телефон: ${phone}
Email для официального ответа: ${email}

ЖАЛОБА
на нарушение жилищного законодательства и бездействие управляющей организации ${company.name}

Я являюсь собственником жилого помещения по адресу: ${address}${apartment} (${company.complexName}). Управление многоквартирным домом осуществляет ${company.name} (юридический адрес: ${company.address}, email: ${company.email}).

${sentDate} мною в адрес управляющей организации ${company.name} была направлена официальная претензия по вопросу: «${claim.title}». Согласно п. 36 Правил осуществления деятельности по управлению многоквартирными домами (утв. ПП РФ № 416), установленный законом 10-дневный срок (в рабочих днях) для рассмотрения обращения и направления мотивированного ответа истек ${deadlineDate}.

До настоящего времени ${company.name} уклоняется от исполнения своих обязанностей по договору управления, не устраняет допущенные нарушения прав собственников и нарушает порядок рассмотрения обращений граждан, чем нарушает требования ч. 2.3 ст. 161 ЖК РФ, ПП РФ № 354, ПП РФ № 491 и ПП РФ № 416.

На основании изложенного, руководствуясь ст. 10, ст. 21, ст. 24 Федерального закона от 17.01.1992 № 2202-1 «О прокуратуре Российской Федерации» и Федеральным законом № 59-ФЗ,

ПРОШУ:
1. Провести прокурорскую проверку исполнения жилищного законодательства в деятельности управляющей организации ${company.name} по изложенным фактам.
2. Внести руководителю ${company.name} представление об устранении нарушений федерального законодательства и восстановлении нарушенных прав собственников жилых помещений.
3. Решить вопрос о возбуждении в отношении ${company.name} и (или) ее должностных лиц дела об административном правонарушении по ч. 2 ст. 14.1.3 КоАП РФ и (или) ст. 7.23.3 КоАП РФ.
4. Направить письменный ответ о результатах проверки и принятых мерах прокурорского реагирования на электронную почту ${email}.

Приложение: скриншот ранее направленной претензии в ${company.name} от ${sentDate} («${claim.title}») с подтверждением даты отправки.`;

  return { subject, body, email: PROSECUTOR_SIMFEROPOL_EMAIL };
}


