$(function(){
  $('[id^=create]').on('click', e => {
    alert('clicked')

    let url = 'http://localhost:8080/test'
    $.ajax({
      type: 'POST',
      url: url,
      success: succ
    })
  })
})

function succ(a){
  console.log(a)
}
