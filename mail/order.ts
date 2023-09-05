// 주문이 접수되었을 때, 사용자에게 보내는 메일
export const orderMail = (props: {
    store: string
    orderedAt: string
    orderId: string
    detailURI: string
}) => `
<img src="https://daxrvmzwgfifuornneda.supabase.co/storage/v1/object/public/Public%20Assets/brand_text_horizontal_24h.png" alt="인카트 로고" height="18" style="margin-top: 12px; margin-bottom: 12px;">
<hr>
<h3 style="margin-top: 24px;">주문이 접수되었습니다</h3>
<p><b>${props.store}</b>에서 상품을 구매해주셔서 고맙습니다.</p>
<ol>
  <li>구매 일시: ${props.orderedAt}</li>
  <li>주문 번호: ${props.orderId}</li>
</ol>
<p>주문과 배송에 관련된 더 많은 정보는 아래 링크에서 확인할 수 있습니다</p>
<a href="${props.detailURI}">
  ${props.detailURI}
</a>
<hr>
<p>인카트와 포스티카는 상품 판매의 당사자가 아닙니다.</p>
<p style="margin-top: 24px; margin-bottom: 24px;">
  사업자등록번호: 484-26-01833 <br />
  대표: 박정한<br />
  이메일: rycont@postica.app<br />
  호스팅제공자: 클라우드플레어코리아 유한책임회사, Supabase Inc, Deno Land Inc<br />
  주소: 강원도 화천군 간동면 온수길 12
</p>
`
