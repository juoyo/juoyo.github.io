<script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.js"></script>
$(function() {
                var iframe = $("div.video_bofang iframe"); //播放页面
                $('ul.video_show_con li a').click(function() {
                    iframe.attr("src", $(this).attr("name")); //更改iframe src
                    $('ul.video_show_con li a').removeClass('on');
                    $(this).addClass('on'); //给点击的元素添加正在播放标识
                });
            }); 
            /*title切换*/
            function showTitle(title) {
                var TitleType = title.getAttribute("data-title");
                document.getElementById("video_con_title").innerHTML = TitleType;
            }
            /*向上滚动*/
            function AutoScroll(obj) {
                                $(obj).find("ul:first").animate({
                                    marginTop: "-40px"
                                },
                                800,
                                function() {
                                    $(this).css({
                                        marginTop: "0px"
                                    }).find("li:first").appendTo(this);
                                });
                            }
                            $(document).ready(function() {
                                setInterval('AutoScroll("#scroll")', 2500)
            });
