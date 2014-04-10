$(function() {

    var container = document.getElementById('canvas');

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
        }
    }).bind('keyup', function() {
        $(this).ColorPickerSetColor(this.value);
    });

    $("#reset").click(function() {
        $("#canvas").children().remove();
        init(container, document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetWidth, '#ddd');
    });

    $(".objet, .terrain").click(function() {
        $("#eraser, #pencil").removeClass('active');
    });

    $("#eraser, #pencil").click(function() {
        $(".objet, .terrain").each(function() {
            $(this).removeClass('active');
        });
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
        var ctx = canvas.context;
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
        ctx.clearTo(fillColor || "#ddd");

        function draw(e) {
            if (!canvas.isDrawing) {
                return;
            }
            var diametre = parseInt($("#diametre").val());
            if (isNaN(diametre)) {
                diametre = 50;
            }
            var carre = $("#carre").hasClass('active');
            var terrain = $(".terrain.active").find("img").attr("src");
            if (typeof terrain === 'undefined') {
                return null;
            }
            var x = e.pageX - $("#canvas").position().left - 15;
            var y = e.pageY - $("#canvas").position().top;
            var img = new Image();
            var ctx = canvas.context;
            img.src = terrain;
            pFill = ctx.createPattern(img, "repeat");
            ctx.fillStyle = pFill;
            if (carre === true) {
                ctx.fillRect(x, y, diametre, diametre);
            } else {
                ctx.fillCircle(x, y, diametre / 2, pFill);
            }
        }

        function brush(e) {
            if (!canvas.isDrawing) {
                return;
            }
            var diametre = parseInt($("#diametre").val());
            if (isNaN(diametre)) {
                diametre = 50;
            }
            var carre = $("#carre").hasClass('active');
            var terrain = $(".terrain.active").find("img").attr("src");
            if (terrain === "") {
                return;
            }
            var color = $("#colorpickerField1").val();
            if (color === "") {
                color = '000000';
            }
            var x = e.pageX - $("#canvas").position().left - 15;
            var y = e.pageY - $("#canvas").position().top;
            var ctx = canvas.context;
            var fillColor = '#' + color;
            if (carre === true) {
                ctx.fillStyle = fillColor;
                ctx.fillRect(x, y, diametre, diametre);
            } else {
                ctx.fillCircle(x, y, diametre / 2, fillColor);
            }
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
            var x = e.pageX - $("#canvas").position().left - 15;
            var y = e.pageY - $("#canvas").position().top;
            var fillColor = '#ddd';
            if (carre === true) {
                ctx.fillStyle = fillColor;
                ctx.fillRect(x, y, diametre, diametre);
            } else {
                ctx.fillCircle(x, y, diametre / 2, fillColor);
            }
        }
        
        canvas.node.onmouseover = function(e) {
            //$(this).css('cursor','url(../img/textures/grass.png), auto');
        };
        
        canvas.node.onmousemove = function(e) {
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

        canvas.node.onmousedown = function(e) {
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
        };
    }

    init(container, document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetWidth, '#ddd');

});


