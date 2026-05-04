const https = require('https');

exports.handler = async (event) => {
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

  const prop = (value) => ({
    rich_text: [{ text: { content: String(value || '-') } }]
  });
  const title = (value) => ({
    title: [{ text: { content: String(value || '-') } }]
  });

  const properties = {
    // 제목 (브랜드명)
    "이름": title(data.brand || '미입력'),

    // 1페이지 - 기본정보
    "사업자유형":        prop(data.bizType),
    "법인명":           prop(data.company),
    "법인등록번호":      prop(data.corpno),
    "영업표지(브랜드)":  prop(data.brand),
    "사업자등록번호":    prop(data.bizno),
    "홈페이지":         prop(data.web),
    "소재지주소":       prop(data.addr),
    "대표전화":         prop(data.tel),
    "대표자성명":       prop(data.ceoName),
    "대표자생년월일":   prop(data.ceoBirth),
    "대표자휴대전화":   prop(data.ceoMobile),
    "팩스":            prop(data.fax),
    "이메일":          prop(data.email),
    "담당자성명":       prop(data.mgrName),
    "담당자직위직급":   prop(data.mgrRank),
    "담당자전화":       prop(data.mgrTel),
    "담당자휴대전화":   prop(data.mgrMobile),
    "담당자이메일":     prop(data.mgrEmail),
    "담당자사무실주소": prop(data.mgrAddr),

    // 2페이지 - 현황파악
    "상표등록여부":     prop(data.hasTm),
    "직영점운영여부":   prop(data.hasDirect),
    "재무제표작성여부": prop(data.hasFin),
    "근로자유무":       prop(data.hasEmp),
    "가맹금보호방식":   prop(data.escrowType),
    "예치기관":        prop(data.escrowBank),
    "예치기관지점":     prop(data.escrowBranch),
    "예치기관주소":     prop(data.escrowAddr),
    "예치기관전화":     prop(data.escrowTel),

    // 3페이지 - 계약조건
    "최초계약기간":     prop(data.contractInit ? data.contractInit + '년' : ''),
    "갱신계약기간":     prop(data.contractRenew ? data.contractRenew + '년' : ''),
    "영업지역기준":     prop(data.territoryType),
    "영업지역거리":     prop(data.territoryDist ? data.territoryDist + 'm' : ''),
    "가맹비":          prop(data.feeInitial),
    "교육비":          prop(data.feeEdu),
    "교육기준인원":     prop(data.feeEduPer ? data.feeEduPer + '인' : ''),
    "추가인원인당교육비": prop(data.feeEduAdd),
    "계약이행보증금":   prop(data.feeDeposit),
    "인테리어감리비":   prop(data.feeSupervision),
    "로열티유형":       prop(data.royaltyType),
    "로열티정액금액":   prop(data.royaltyFixedAmt),
    "로열티정액납부일": prop(data.royaltyFixedDay ? '매월 ' + data.royaltyFixedDay + '일' : ''),
    "로열티정률비율":   prop(data.royaltyPctVal ? data.royaltyPctVal + '%' : ''),
    "로열티정률납부일": prop(data.royaltyPctDay ? '매월 ' + data.royaltyPctDay + '일' : ''),
    "영업일":          prop(data.bizDaysWeek && data.bizDaysMonth ? `주 ${data.bizDaysWeek}일, 월 ${data.bizDaysMonth}일` : ''),
    "영업시간":        prop(data.bizOpen && data.bizClose ? `${data.bizOpen}시 ~ ${data.bizClose}시` : ''),
    "결제방식":        prop(data.paymentType),

    // 제출자
    "제출자":          prop(data.submitter),
    "제출일자":        prop(data.submitDate),
  };

  const body = JSON.stringify({
    parent: { database_id: DATABASE_ID },
    properties
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
