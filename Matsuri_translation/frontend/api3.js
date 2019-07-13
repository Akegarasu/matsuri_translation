function submit_task() {
    var url = $('#url').val();
    url = url.replace("mobile.twitter.com", "twitter.com");
    //var translation = $('#translation').val().replace(/\r\n|\r|\n/g, '\\r');
    $('#progress').val("开始获取图像");
    $('#url').css("display", "none");
    $('#progress').css("display", "");


    var jqxhr = $.ajax({
        url: "/api/tasks",
        type: "post",
        data: JSON.stringify({
            "url": url,
            "translation": ""
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    }).done(function (data) {
        fetch_img(data.task_id)
    })
}

function fetch_img(task_id) {
    var count = 0;
    var locked = false;
    var event = setInterval(function () {
        if (locked) return;
        locked = true;
        count += 1;

        var jqxhr = $.ajax({
            url: '/api/get_task=' + task_id,
            success: function (data, status, xhr) {
                locked = false;
                if (data.state === "SUCCESS") {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', 'cache/' + data.result + '.png');
                    xhr.onprogress = function (event) {
                        if (event.lengthComputable) {
                            //console.log((event.loaded / event.total) * 100); // 进度
                            $('#progress').val("正在下载图片 (" + Math.round((event.loaded / event.total) * 100) + "%)");
                        }
                    };

                    xhr.onload = function (e) {
                        $("#screenshots").html("            <div id=\"screenshotclip0\" class=\"screenshotclip\"\n" +
                            "             style=\"height: 800px;background-image: url('img/twittersample.jpg')\"></div>");
                        $("#screenshotclip0").css("background-image", 'url("cache/' + data.result + '.png")');
                        $('#url').css("display", "");
                        $('#progress').css("display", "none");
                        clip_screenshot();
                        refresh_trans_div();
                    };
                    xhr.send();
                    $.get('cache/' + data.result + '.txt', function (data, status) {
                        console.log(data);
                        show_translate(JSON.parse(data));
                        refresh_trans_div();
                    });
                    clearInterval(event);
                }
            },
            error: function (xhr, info, e) {
                console.log(info);
                alert("服务器错误，请检查您提供的地址是否为正确的推特地址");
                $('#url').css("display", "");
                $('#progress').css("display", "none");
            },
            dataType: 'json',
        });
        $('#progress').val("等待服务器响应，已尝试" + count + "次");
    }, 100)
}

var tweetpos;
var templatechosen = [];

function show_translate(data) {
    console.log(data);
    tweetpos = data;
    templatechosen = [];
    $("#translatetbody").html("");
    for (var i = 0; i < tweetpos.length; i++) {
        templatechosen.push("");
        $("#translatetbody").append("<tr>\n" +
            "      <th scope=\"row\">" +
            "<input type=\'checkbox\' " + (i == 0 ? "checked" : "") + " id=\'show" + i + "\'>" +
            "</th>\n" +
            "      <td class='originaltext'>" + tweetpos[i].text + "</td>\n" +
            "      <td><div class=\'translatetd\' id=\'translatetd" + i + "\' " + (i > 0 ? "style='display:none'" : "") + " >" +
            "<textarea id=\'transtxt" + i + "\' " + (i == 0 ? "style='height:100px'" : "") + "></textarea>\n      <div class=\"dropdown templatedropdown\">\n  <button class=\"btn btn-secondary dropdown-toggle\" type=\"button\" id=\"dropdownMenu" + i + "\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n    模板选择\n  </button>\n  <div class=\"dropdown-menu dropdownmenuitems\" aria-labelledby=\"dropdownMenu" + i + "\" id=\"dropdownmenuitems" + i + "\">\n  </div>\n</div>\n      " +
            "</div></td>\n" +
            "    </tr>");

        $("#transtxt" + i).focus(function () {
            $("#screenshotclip" + $("tbody textarea").index(this))[0].scrollIntoView();
        });
        $("#transtxt" + i).keyup(function () {
            refresh_trans_div();
            $("#screenshotclip" + $("tbody textarea").index(this))[0].scrollIntoView();

        });
        $("#transtxt" + i).change(function () {
            refresh_trans_div();
            $("#screenshotclip" + $("tbody textarea").index(this))[0].scrollIntoView();

        });
        $("#show" + i).change(refresh_trans_div);

    }
    $(".originaltext").click(function () {
        $("#show" + $(".originaltext").index(this)).click();
    })
}


function clip_screenshot() {
    for (var i = 0; i < tweetpos.length; i++) {
        if (tweetpos[i].bottom > 2000) break;
        $("#screenshotclip" + i).css("height", tweetpos[i].bottom - (i == 0 ? 0 : tweetpos[i - 1].blockbottom));
        $("#screenshotclip" + i).after("<div class='screenshotclip' id='" + "screenshotclip" + (i + 1) + "'></div>");
        $("#screenshotclip" + i).after("<div class='screenshotclip' id='" + "screenshotclip" + (i + 1000) + "'></div>");
        $("#screenshotclip" + (i + 1)).css("background-image", $("#screenshotclip" + i).css("background-image"));
        $("#screenshotclip" + (i + 1000)).css("background-image", $("#screenshotclip" + i).css("background-image"));
        $("#screenshotclip" + (i + 1)).css("width", $("#screenshotclip" + i).css("width"));
        $("#screenshotclip" + (i + 1000)).css("width", $("#screenshotclip" + i).css("width"));
        $("#screenshotclip" + (i + 1)).css("height", 2000 - tweetpos[i].blockbottom);
        $("#screenshotclip" + (i + 1000)).css("height", tweetpos[i].blockbottom - tweetpos[i].bottom);
        $("#screenshotclip" + (i + 1)).css("background-position-y", -tweetpos[i].blockbottom);
        $("#screenshotclip" + (i + 1000)).css("background-position-y", -tweetpos[i].bottom);
        $("#screenshotclip" + (i + 1)).css("display", "none");
        $("#screenshotclip" + (i + 1000)).css("display", "none");


        $("#screenshotclip" + i).after("<div class='screenshotclip' id='" + "translatediv" + i + "'></div>");
    }
}

function refresh_trans_div() {
    var template = $("#translatetemp").val();
    if (template != "") localStorage.setItem("translatetemp", template);
    var isMultiMode = true;
    var templates = [];
    var names = template.match(/<!--.*-->/g);
    var contents = template.split(/<!--.*-->/g);
    try {
        for (var i = 0; i < names.length; i++) {
            names[i] = names[i].replace("<!--", "").replace("-->", "");
        }
        for (var i = 0; i < names.length / 2; i++) {
            if (names[i * 2] == names[i * 2 + 1]) {
                templates.push({
                    name: names[i * 2], content: contents[i * 2 + 1]
                })
            } else {
                throw null;
            }
        }
    } catch (e) {
        isMultiMode = false;
        templates = [{name: "", content: template}];
    }
    //console.log(templates);
    if (isMultiMode) $('.templatedropdown').show(); else $('.templatedropdown').hide();
    $('.dropdownmenuitems').html("");
    for (var i = 0; i < templates.length; i++) {
        $('.dropdownmenuitems').append('<button class="dropdown-item templatebutton" type="button">' + templates[i].name + '</button>')
    }
    $('.templatebutton').click(function () {
        var i=$('.dropdownmenuitems').index($(this).parent());
        templatechosen[i] = $(this).text().trim();
        $("#translatediv"+i)[0].scrollIntoView();
        refresh_trans_div();
    });
    for (var i = 0; i < tweetpos.length; i++) {
        if ($("#show" + i).is(':checked')) {
            $("#screenshotclip" + i).show();
            $("#screenshotclip" + (i + 1000)).show();
            $("#translatediv" + i).show();
            $("#translatetd" + i).show();

        } else {
            $("#screenshotclip" + i).hide();
            $("#screenshotclip" + (i + 1000)).hide();
            $("#translatediv" + i).hide();
            $("#translatetd" + i).hide();
        }
        $("#translatediv" + i).html("");
        if ($("#transtxt" + i).val() != "") {
            var transtxt = $("#transtxt" + i).val();
            transtxt = transtxt.split("\n").join("<br>");
            var templateusing = template;
            if (isMultiMode) {
                templateusing = templates[0].content;
                for (var j = 0; j < templates.length; j++)
                    if (templates[j].name == templatechosen[i]) templateusing = templates[j].content;
            }
            $("#translatediv" + i).html(templateusing.replace("{T}", transtxt));
        }
    }


}

function getUrlParam(k) {
    var regExp = new RegExp('([?]|&)' + k + '=([^&]*)(&|$)');
    var result = window.location.href.match(regExp);
    if (result) {
        return decodeURIComponent(result[2]);
    } else {
        return null;
    }
}

$(function () {

    if (getUrlParam("template") != null && getUrlParam("template").length > 0) {
        $.get(getUrlParam("template"), function (data, status) {
            console.log(data);
            if (confirm("将要用链接的内容替代现有的翻译模板，确认覆盖？")) localStorage.setItem("translatetemp", data);
            window.location.href = "/";
        });
    }
    $("#btnToggleTemplate").click(function () {
        if ($("#translatetemp").css("display") == "none") $("#translatetemp").show(); else $("#translatetemp").hide();
    });
    $('#button-submit').click(function () {
        submit_task();
    });
    if (localStorage.getItem("translatetemp") == null) localStorage.setItem("translatetemp", '<div style="margin:10px 38px">\n' +
        '<img src="img/gongfang_official.png" height="38">\n' +
        '<div style="font-size:27px;">{T}</div>\n' +
        '</div>')
    $("#translatetemp").val(localStorage.getItem("translatetemp"));
    $("#translatetemp").keyup(refresh_trans_div);

    if (getUrlParam("tweet") != null && getUrlParam("tweet").length > 0) {
        $('#url').val(getUrlParam("tweet"));
        submit_task();
    }

});

function downloadAsCanvas() {
    $('body')[0].scrollIntoView();
    html2canvas(document.querySelector("#screenshots")).then(canvas => {
        //createAndDownloadFile("twitterImg" + new Date().getTime() + ".png", canvas.toDataURL("image/png"));
        canvas.toBlob(function (blob) {
            saveAs(blob, "twitterImg" + new Date().getTime() + ".png");
        });
    });
}