$(function() {

    var container = document.getElementById('canvas');
    var lastX, lastY, ctx;
    var cPushArray = new Array();
    var cStep = -1;
    var arrShortCut = [{name: 'ctrly', key: 89}, {name: 'ctrlz', key: 90}];
    var iShortCutControlKey = 17; // CTRL;
    var bIsControlKeyActived = false;
    var current_layer = 0;

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

    $("#reset").click(function() {
        $("#canvas").children().remove();
        init(container, document.getElementById("canvas").offsetWidth - 15, document.getElementById("canvas").offsetWidth, '#ffffff');
    });

    $(".terrain").click(function() {
        $("#eraser, #pencil, .objet").removeClass('active');
    });

    $(".objet").click(function() {
        $("#eraser, #pencil, .terrain").removeClass('active');
    });

    $("#eraser, #pencil").click(function() {
        $(".objet, .terrain").each(function() {
            $(this).removeClass('active');
        });
    });

    $("#add_layer").click(function() {
        $('.layers').prepend('<li><a data-layer="' + current_layer + '" href="#">Calque ' + current_layer + ' <i class="btn fa fa-times fa-lg pull-right removeLayer"></i></a></li>');
        var canvas = init(container, document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetWidth, '#ffffff');
        $('.layers li').removeClass('active');
        $('.layers li:first').addClass('active');
        ctx.clearRect(0, 0, canvas.node.width, canvas.node.height);
    });

    $(document).on('click', '.removeLayer', function() {
        var num_layer = parseInt($(this).parent().attr('data-layer'));
        $(this).parent().parent().remove();
        $('canvas[data-layer="' + num_layer + '"]').remove();
    });

    $(document).on('click', '.layers li', function() {
        var layer_active = parseInt($(this).children(':first').attr('data-layer'));
        $(".layers li").removeClass('active');
        $(this).addClass('active');
        $('canvas').css('z-index', -1);
        $('canvas[data-layer="' + layer_active + '"]').css('z-index', layer_active);
    });

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
            var terrain = $(".objet.active").find("img").attr("src");
            var diametre = $(".objet.active").find("img").attr("width");
            var cote = $(".objet.active").find("img").attr("height");
            var x = -diametre / 2;
            var y = -cote / 2;
            $('canvas').css('cursor', 'url("' + terrain + '")' + x + ' ' + y + ', pointer');
        };

        canvas.node.onmousedown = function(e) {
            if (e.which === 3) {
                return;
            }
            canvas.isDrawing = true;
            var eraser = false;
            var pencil = false;
            if ($("#eraser").hasClass('active')) {
                eraser = true;
            } else if ($("#pencil").hasClass('active')) {
                pencil = true;
            }

            if (eraser === true) {
                erase(e);
            } else if (pencil === true) {
                brush(e);
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
            if (cStep < cPushArray.length) {
                cPushArray.length = cStep;
            }
            cPushArray.push(canvas.node.toDataURL());
        }
        function cUndo() {
            if (cStep > 0) {
                cStep--;
                var canvasPic = new Image();
                canvasPic.src = cPushArray[cStep];
                canvasPic.onload = function() {
                    ctx.drawImage(canvasPic, 0, 0);
                };
            }
        }
        function cRedo() {
            if (cStep < cPushArray.length - 1) {
                cStep++;
                var canvasPic = new Image();
                canvasPic.src = cPushArray[cStep];
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

    init(container, document.getElementById("canvas").offsetWidth - 15, document.getElementById("canvas").offsetWidth, '#ffffff');
});


