document.addEventListener("DOMContentLoaded", function(event) {
  var meta = document.createElement('meta');
  meta.name = "viewport";
  meta.content = "width="+screen.width;
  // Allow user to zoom or not?
  //+ ",user-scalable=no";
  document.head.appendChild(meta);
  document.body.style.display = 'unset';


  document.getElementById('pause') && document.getElementById('pause').addEventListener('click',function(evnet){
    if(document.getElementById('play').children[0].children[0].classList.contains('on')){
      document.getElementById('pause').children[0].children[0].style.opacity='0.5';
    }

  });
  document.getElementById('play') && document.getElementById('play').addEventListener('click',function(evnet){
    if(document.getElementById('pause').children[0].children[0].style.opacity == '0.5'){
      setTimeout(function(){
        document.getElementById('pause').children[0].children[0].style.opacity = '1';
      },600);
      
    }
  });

});
