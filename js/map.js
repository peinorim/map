$(function() {

    var container = document.getElementById('canvas');
    var lastX, lastY, lastXX, lastYY, ctx = null;
    var cPushArray = new Array();
    var cStep = -1;
    var arrShortCut = [{name: 'ctrly', key: 89}, {name: 'ctrlz', key: 90}];
    var iShortCutControlKey = 17; // CTRL;
    var bIsControlKeyActived = false;
    var current_layer = 0;
    var layer_active = 0;
    var width = document.getElementById("canvas").offsetWidth - 15;
    var height = document.getElementById("canvas").offsetWidth;

    $('#colorpickerField1').ColorPicker({
        onSubmit: function(hsb, hex, rgb, el) {
            $(el).val(hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function() {
            $(this).ColorPickerSetColor(this.value);
        },
        onChange: function(hsb, hex, rgb) {
            $('#colorpickerField1').val(hex);
            $('#colorpickerField1').siblings().css('color', '#' + hex);
        }
    }).bind('keyup', function() {
        $(this).ColorPickerSetColor(this.value);
    });

    $('.colorpicker').css('z-index', 10000);

    $("#reset").click(function() {
        $("#canvas").children().remove();
        init(container, document.getElementById("canvas").offsetWidth - 15, document.getElementById("canvas").offsetWidth, '#ffffff');
    });

    $(".terrain, .objet").click(function() {
        $("#textForm").hide();
        $('#tack').hide();
        $('#tack').css('left', '');
        $('#tack').css('top', '');
        $("#eraser, #pencil, .objet, #text, #line, #dash").removeClass('active');
    });

    $("#eraser, #pencil, #text, #line, #dash").click(function() {
        lastX = null;
        lastY = null;
        lastXX = null;
        lastYY = null;
        $("#textForm").hide();
        $('#tack').hide();
        $('#tack').css('left', '');
        $('#tack').css('top', '');
        $(".objet, .terrain").removeClass('active');
    });

    $("#add_layer").click(function() {
        $('.layers').prepend('<li><a data-layer="' + current_layer + '" href="#"><i style="padding: 6px 0px;color:black;" class="fa fa-eye fa-lg pull-left hideLayer"></i> Calque ' + current_layer + ' <i style="padding: 6px 12px;" class="fa fa-times fa-lg pull-right removeLayer"></i></a></li>');
        var canvas = init(container, $('canvas:first').width(), $('canvas:first').height(), '#ffffff');
        $('.layers li').removeClass('active');
        $('.layers li:first').addClass('active');
        layer_active = $('.layers li.active').children(':first').attr('data-layer');
        ctx.clearRect(0, 0, canvas.node.width, canvas.node.height);
    });

    $(document).on('click', '.removeLayer', function() {
        var num_layer = parseInt($(this).parent().attr('data-layer'));
        $(this).parent().parent().remove();
        $('canvas[data-layer="' + num_layer + '"]').remove();
        $('.layers li:first').addClass('active');
        layer_active = parseInt($('.layers li.active').children(':first').attr('data-layer'));
        return false;
    });

    $(document).on('click', '.hideLayer', function() {
        var num_layer = parseInt($(this).parent().attr('data-layer'));

        if ($(this).css('color') === 'rgb(0, 0, 0)') {
            $('canvas[data-layer="' + num_layer + '"]').css('opacity', 0);
            $(this).css('color', 'red');
        } else {
            $('canvas[data-layer="' + num_layer + '"]').css('opacity', 1);
            $(this).css('color', 'black');
        }

        return false;
    });

    $(document).on('click', '.layers li', function() {
        layer_active = parseInt($(this).children(':first').attr('data-layer'));
        $(".layers li").removeClass('active');
        $(this).addClass('active');
        $('canvas').css('z-index', -1);
        $('#textForm').css('z-index', -1);
        $('#tack').css('z-index', -1);
        $('canvas[data-layer="' + layer_active + '"]').css('z-index', layer_active);
    });

    $('#export').click(function() {
        $('#exportContainer').children().remove();
        var x = document.getElementById("canvas").getElementsByTagName("canvas");
        var canvas = createCanvas(document.getElementById('exportContainer'), width, height);
        canvas.context.fillStyle = '#ffffff';
        canvas.context.fillRect(0, 0, width, height);
        //canvas.context.clearRect(0, 0, canvas.node.width, canvas.node.height);
        for (key in x) {
            if (typeof x[key] === 'object') {
                canvas.context.drawImage(x[key].getContext("2d").canvas, 0, 0);
            }
        }
        var final = new Image();
        final.src = canvas.context.canvas.toDataURL("image/png");
        final.onload = function() {
            window.open(canvas.node.toDataURL("image/png"),'_blank');
        };
    });

    $("#textForm").draggable({containment: "parent"});

    function createCanvas(parent, width, height) {
        var canvas = {};
        canvas.node = document.createElement('canvas');
        canvas.context = canvas.node.getContext('2d');
        canvas.node.width = width;
        canvas.node.height = height;
        parent.appendChild(canvas.node);
        return canvas;
    }

    function init(container, width, height, fillColor) {

        var canvas = createCanvas(container, width, height);
        ctx = canvas.context;
        ctx.clearTo = function(fillColor) {
            w = width || document.getElementById("canvas").offsetWidth;
            h = height || document.getElementById("canvas").offsetWidth;
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, w, h);
        };
        ctx.fillCircle = function(x, y, radius, fillColor) {
            this.fillStyle = fillColor;
            this.beginPath();
            this.moveTo(x, y);
            this.arc(x, y, radius, 0, Math.PI * 2, false);
            this.fill();
        };
        ctx.clearTo = function(fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, width, height);
        };
        ctx.clearTo(fillColor || "#ffffff");

        function showText(e) {
            if (!canvas.isDrawing) {
                return;
            }
            $(".terrain").removeClass('active');
            $(".objet").removeClass('active');
            $('#textContent').val('');
            $('#textForm').show();
            layer_active = $('.layers li.active').children(':first').attr('data-layer');
            $('#textForm').css('left', e.pageX - $("#canvas").position().left);
            $('#textForm').css('top', e.pageY - $("#canvas").position().top);
            $('#textForm').css('z-index', layer_active + 1);
        }

        function draw(e) {
            if (!canvas.isDrawing) {
                return;
            }
            if ($(".objet").hasClass('active')) {
                var terrain = $(".objet.active").find("img").attr("src");
                var diametre = $(".objet.active").find("img").attr("width");
                var cote = $(".objet.active").find("img").attr("height");
            } else {
                var diametre = parseInt($("#diametre").val());
                var terrain = $(".terrain.active").find("img").attr("src");
                var cote = diametre;
            }
            if (isNaN(diametre)) {
                diametre = 50;
            }
            var carre = $("#carre").hasClass('active');
            if (typeof terrain === 'undefined') {
                return null;
            }
            var x = e.pageX - $("#canvas").position().left - diametre / 2;
            var y = e.pageY - $("#canvas").position().top - cote / 2;
            var img = new Image();
            var ctx = canvas.context;
            img.src = terrain;
            if (carre === true && !$(".objet").hasClass('active')) {
                var pFill = ctx.createPattern(img, "repeat");
                ctx.fillStyle = pFill;
                ctx.fillRect(x, y, diametre, diametre);
            } else if ($(".objet").hasClass('active')) {
                ctx.drawImage(img, x + diametre / 2, y + cote / 2, diametre, cote);
            } else {
                var pFill = ctx.createPattern(img, "repeat");
                ctx.fillStyle = pFill;
                ctx.fillCircle(x + diametre / 2, y + cote / 2, diametre / 2, pFill);
            }
        }

        function brush(e) {
            if (canvas.isDrawing) {

                var diametre = parseInt($("#diametre").val());
                if (isNaN(diametre)) {
                    diametre = 50;
                }
                var terrain = $(".terrain.active").find("img").attr("src");
                if (terrain === "") {
                    return;
                }
                var color = $("#colorpickerField1").val();
                if (color === "") {
                    color = '000000';
                }
                var x = e.pageX - $("#canvas").position().left;
                var y = e.pageY - $("#canvas").position().top;
                ctx = canvas.context;
                var fillColor = '#' + color;
                ctx.fillCircle(x, y, diametre / 2, fillColor);
                ctx.beginPath();
                ctx.strokeStyle = fillColor;
                ctx.lineWidth = diametre;
                ctx.lineJoin = "round";
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.stroke();
            }
            lastX = x;
            lastY = y;
        }

        function traceLine(e) {
            if (canvas.isDrawing) {
                var diametre = parseInt($("#diametre").val());
                if (isNaN(diametre)) {
                    diametre = 50;
                }
                var color = $("#colorpickerField1").val();
                if (color === "") {
                    color = '000000';
                }
                var x = e.pageX - $("#canvas").position().left;
                var y = e.pageY - $("#canvas").position().top;
                var fillColor = '#' + color;
                ctx.beginPath();
                ctx.strokeStyle = fillColor;
                ctx.setLineDash([diametre, 0]);
                ctx.lineWidth = diametre;
                ctx.lineJoin = "round";
                if (lastX !== null && lastY !== null) {
                    ctx.moveTo(lastX, lastY);
                }
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.stroke();
                $('#tack').show();
                $('#tack').css('z-index', layer_active + 1);
                $('#tack').css('left', x);
                $('#tack').css('top', y - 20);
            }
            lastX = x;
            lastY = y;
        }

        function traceDash(e) {
            if (canvas.isDrawing) {
                var color = $("#colorpickerField1").val();
                if (color === "") {
                    color = '000000';
                }
                var x = e.pageX - $("#canvas").position().left;
                var y = e.pageY - $("#canvas").position().top;
                var fillColor = '#' + color;
                ctx.beginPath();
                ctx.strokeStyle = fillColor;
                ctx.setLineDash([10, 15]);
                if (lastXX !== null && lastYY !== null) {
                    ctx.moveTo(lastXX, lastYY);
                }
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.stroke();
                $('#tack').show();
                $('#tack').css('z-index', layer_active + 1);
                $('#tack').css('left', x);
                $('#tack').css('top', y - 20);
            }
            lastXX = x;
            lastYY = y;
        }

        function erase(e) {
            if (!canvas.isDrawing) {
                return;
            }

            var diametre = parseInt($("#diametre").val());
            if (isNaN(diametre)) {
                diametre = 50;
            }
            var carre = $("#carre").hasClass('active');
            var x = e.pageX - $("#canvas").position().left;
            var y = e.pageY - $("#canvas").position().top;
            var fillColor = '#ffffff';
            if (carre === true) {
                ctx.fillStyle = fillColor;
                ctx.fillRect(x - diametre / 2, y - diametre / 2, diametre, diametre);
            } else {
                ctx.fillCircle(x, y, diametre / 2, fillColor);
            }
        }

        canvas.node.onmousemove = function(e) {
            var eraser = false;
            var pencil = false;
            if ($("#eraser").hasClass('active')) {
                eraser = true;
            } else if ($("#pencil").hasClass('active')) {
                pencil = true;
            }

            if ($(".objet").hasClass('active')) {
                return;
            }

            if (eraser === true) {
                erase(e);
            } else if (pencil === true) {
                brush(e);
            } else {
                draw(e);
            }
        };

        canvas.node.onmouseover = function(e) {
            if ($("#line").hasClass('active') || $("#dash").hasClass('active')) {
                $('canvas').css('cursor', 'url("img/field_objects/thumbtack.png")' + 0 + ' ' + 20 + ', pointer');
            } else {
                var terrain = $(".objet.active").find("img").attr("src");
                var diametre = $(".objet.active").find("img").attr("width");
                var cote = $(".objet.active").find("img").attr("height");
                var x = -diametre / 2;
                var y = -cote / 2;
                $('canvas').css('cursor', 'url("' + terrain + '")' + x + ' ' + y + ', pointer');
            }

        };

        canvas.node.onmousedown = function(e) {
            if (e.which === 3) {
                return;
            }
            canvas.isDrawing = true;
            var eraser = false;
            var pencil = false;
            var text = false;
            var line = false;
            var dash = false;
            if ($("#eraser").hasClass('active')) {
                eraser = true;
            } else if ($("#pencil").hasClass('active')) {
                pencil = true;
            } else if ($("#text").hasClass('active')) {
                text = true;
            } else if ($("#line").hasClass('active')) {
                line = true;
            } else if ($("#dash").hasClass('active')) {
                dash = true;
            }

            if (eraser === true) {
                erase(e);
            } else if (pencil === true) {
                brush(e);
            } else if (text === true) {
                showText(e);
            } else if (line === true) {
                traceLine(e);
            } else if (dash === true) {
                traceDash(e);
            } else {
                draw(e);
            }
        };
        canvas.node.onmouseup = function(e) {
            canvas.isDrawing = false;
            cPush();
        };

        $("#undo").click(function() {
            cUndo();
        });

        $("#redo").click(function() {
            cRedo();
        });

        $("#validText").click(function() {
            var color = $("#colorpickerField1").val();
            if (color === "") {
                color = '000000';
            }
            layer_active = parseInt($(this).children(':first').attr('data-layer'));
            ctx.fillStyle = "#" + color;
            ctx.font = "16px Calibri";
            ctx.fillText($('#textContent').val(), $('#textForm').css('left').split("px")[0], $('#textForm').css('top').split("px")[0]);
            canvas.isDrawing = false;
            cPush();
            $('#textForm').hide();
            $('#textContent').val('');
        });

        $("#cancelText").click(function() {
            canvas.isDrawing = false;
            $("#textForm").hide();
            $('#textContent').val('');
        });

        $(document).keyup(function(e) {
            if (e.which === iShortCutControlKey)
                bIsControlKeyActived = false;
        }).keydown(function(e) {
            if (e.which === iShortCutControlKey)
                bIsControlKeyActived = true;
            if (bIsControlKeyActived === true) {
                jQuery.each(arrShortCut, function(i) {
                    if (arrShortCut[i].key === e.which) {
                        if (arrShortCut[i].key === 89) {
                            cRedo();
                        } else if (arrShortCut[i].key === 90) {
                            cUndo();
                        }
                        return;
                    }
                });
            }
        });

        function cPush() {
            cStep++;
            if (typeof cPushArray[layer_active] === 'undefined') {
                cPushArray[layer_active] = new Array();
            }
            if (cStep < cPushArray[layer_active].length) {
                cPushArray[layer_active].length = cStep;
            }
            cPushArray[layer_active].push(canvas.node.toDataURL());
        }
        function cUndo() {
            if (cStep > 0) {
                cStep--;
                var canvasPic = new Image();
                canvasPic.src = cPushArray[layer_active][cStep];
                canvasPic.onload = function() {
                    ctx.drawImage(canvasPic, 0, 0);
                };
            }
        }
        function cRedo() {
            if (cStep < cPushArray[layer_active].length - 1) {
                cStep++;
                var canvasPic = new Image();
                canvasPic.src = cPushArray[layer_active][cStep];
                canvasPic.onload = function() {
                    ctx.drawImage(canvasPic, 0, 0);
                };
            }
        }
        cPush();
        $(canvas.node).css('z-index', current_layer);
        $(canvas.node).attr('data-layer', current_layer);
        current_layer++;
        return canvas;
    }

    init(container, width, height, '#ffffff');
});


