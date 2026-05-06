const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const s = (v) => String(v || '-');

  // 페이지 본문에 모든 내용 저장 (속성 컬럼 불필요)
  const contentLines = [
    `[기본정보]`,
    `사업자유형: ${s(data.bizType)}`,
    `법인명: ${s(data.company)}`,
    `법인등록번호: ${s(data.corpno)}`,
    `영업표지(브랜드): ${s(data.brand)}`,
    `사업자등록번호: ${s(data.bizno)}`,
    `홈페이지: ${s(data.web)}`,
    `소재지주소: ${s(data.addr)}`,
    ``,
    `[신청인]`,
    `대표전화: ${s(data.tel)}`,
    `대표자: ${s(data.ceoName)}`,
    `대표자 생년월일: ${s(data.ceoBirth)}`,
    `대표자 휴대전화: ${s(data.ceoMobile)}`,
    `팩스: ${s(data.fax)}`,
    `이메일: ${s(data.email)}`,
    ``,
    `[정보공개서 담당자]`,
    `담당자 성명: ${s(data.mgrName)}`,
    `담당자 직위/직급: ${s(data.mgrRank)}`,
    `담당자 전화: ${s(data.mgrTel)}`,
    `담당자 휴대전화: ${s(data.mgrMobile)}`,
    `담당자 이메일: ${s(data.mgrEmail)}`,
    `담당자 사무실 주소: ${s(data.mgrAddr)}`,
    ``,
    `[가맹본부 현황]`,
    `상표 등록 여부: ${s(data.hasTm)}`,
    `직영점 운영 여부: ${s(data.hasDirect)}`,
    `재무제표 작성 여부: ${s(data.hasFin)}`,
    `근로자 유무: ${s(data.hasEmp)}`,
    `가맹금 보호 방식: ${s(data.escrowType)}`,
    `예치기관: ${s(data.escrowBank)} ${s(data.escrowBranch)}`,
    `예치기관 주소: ${s(data.escrowAddr)}`,
    `예치기관 전화: ${s(data.escrowTel)}`,
    ``,
    `[가맹계약 조건]`,
    `최초 계약기간: ${s(data.contractInit)}년`,
    `갱신 계약기간: ${s(data.contractRenew)}년`,
    `영업지역: ${s(data.territoryType)} ${s(data.territoryDist)}m`,
    `가맹비: ${s(data.feeInitial)}`,
    `교육비: ${s(data.feeEdu)} / ${s(data.feeEduPer)}인 기준, 추가 1인당 ${s(data.feeEduAdd)}`,
    `계약이행보증금: ${s(data.feeDeposit)}`,
    `인테리어 감리비: ${s(data.feeSupervision)}`,
    `로열티 유형: ${s(data.royaltyType)}`,
    `로열티 정액금액: ${s(data.royaltyFixedAmt)} / 매월 ${s(data.royaltyFixedDay)}일`,
    `로열티 정률비율: ${s(data.royaltyPctVal)}% / 매월 ${s(data.royaltyPctDay)}일`,
    `영업일: 주 ${s(data.bizDaysWeek)}일, 월 ${s(data.bizDaysMonth)}일`,
    `영업시간: ${s(data.bizOpen)}시 ~ ${s(data.bizClose)}시`,
    `결제방식: ${s(data.paymentType)}`,
    ``,
    `[제출 정보]`,
    `제출자: ${s(data.submitter)}`,
    `제출일: ${s(data.submitDate)}`,
  ];

  const children = contentLines.map(line => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: line } }]
    }
  }));

  const body = JSON.stringify({
    parent: { database_id: DATABASE_ID },
    properties: {
      "이름": {
        title: [{ text: { content: s(data.brand) + ' (' + s(data.submitter) + ')' } }]
      }
    },
    children
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.notion.com',
      path: '/v1/pages',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ ok: true })
          });
        } else {
          resolve({
            statusCode: res.statusCode,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ ok: false, error: responseData })
          });
        }
      });
    });
    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ok: false, error: e.message })
      });
    });
    req.write(body);
    req.end();
  });
};
