var canvas;
var ctx;
var timer_id;

var WIDTH_X = 25;
var WIDTH_Y = 25;

var STATE_EMPTY = 0;
var STATE_PUT = 1;
var STATE_DEAD = 2;
var STATE_HOT = 3;

// EMPTY, PUT, DEAD, HOT
var color = ["#cdf", "#fda", "#bbb", "#fa0"];
var color_hot = "";

var max_x = 9;
var max_y = 9;
var _field = [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0
];

var alphabet = [
    'l', 'h', 'i', 'k', 'o', 'a', 'v',
    'r', 'q', 's', 'c', 'z', 'l', 'p',
    'u', 'w', 'a', 'l', 'n', 'f', 'o',
    't', 'y', 'k', 'a', 'j', 'e', 'h',
    'a', 'h', 'i', 't', 's', 'y', 'd',
    'e', 'f', 'o', 'p', 't', 'x', 'n',
    'r', 'u', 'z', 'w', 'y', 'v', 'e'
];

$(document).ready(function(){
    canvas = $('#canv')[0];
    ctx = canvas.getContext('2d');

    put(_field, 2, 2);
    put(_field, 3, 4);

    fpush(_field, -1, 0);

    draw_field(_field);
    mouse_event();

    //interval();
    //run();
});

function run()
{
    timer_id = setInterval(interval, 1);
}

var max = 0;
var current_fields = [];

function interval()
{
    var _f = fpop();
    if (_f === undefined)
    {
        clearInterval(timer_id);
        alert("end");
        return;
    }

    var f = _f[0];
    var x = _f[1];
    var y = _f[2];

    var xy = next_empty(f, x, y);

    if (xy !== null) {
        var nx = xy[0];
        var ny = xy[1];

        if (next_empty(f, nx, ny) !== null) {
            fpush(f, nx, ny);
        }

        put(f, nx, ny);
        draw_field(f, nx, ny);

        // もともとこれだったけど、
        // いらない（無駄な過去に行った重複の探索だと判断）
        // x, yより後ろを探索すれば良い
        //fpush(f, -1, 0); 
        if (next_empty(f, x, y) !== null) {
            fpush(f, x, y);
        }
    }

    var count = count_queen(f)
    if (max <= count) {
        max = count;
        //var ans = tostring(f);
        ans = [1, 1];
        draw_field_thumb(f);
        $('#debug').html(max + "<br/>" + count + "<br/>" + ans[0] + "<br/>" + ans[1]);
    }
}

function fpush(f, x, y)
{
    current_fields.push([array_clone(f), x, y]);
}

function fpop()
{
    var f = current_fields.pop();

    if (f === undefined)
    {
        return f;
    }
    else
    {
    }

    var _field = array_clone(f[0]);
    var x = f[1];
    var y = f[2];
    return [_field, x, y];
}

function flast()
{
    if (current_fields.length > 0)
    {
        return current_fields[current_fields.length - 1];
    }
    else
    {
        return undefined;
    }
}

function count_queen(f)
{
    var c = 0;
    for (var i = 0, len = f.length; i < len; i++)
    {
        if (f[i] === STATE_PUT)
        {
            c++;
        }
    }

    return c;
}

function tostring(f)
{
    var queen = [];
    for (var i = 0, len = f.length; i < len; i++)
    {
        if (f[i] === STATE_PUT)
        {
            var xy = to_xy(i);
            var x = xy[0] + 1;
            var y = xy[1] + 1;

            queen.push({"char": alphabet[i],  "k": x * y});
        }
    }

    queen.sort(function(a, b) { return (a.k < b.k ? -1 : (a.k > b.k ? 1 : 0)); });

    var word = [];
    var sum = 0;
    for (var i = 0, len = queen.length; i < len; i++)
    {
        word.push(queen[i]["char"] + ":" + queen[i]["k"]);
        sum += queen[i]["k"];
    }
    return [word.join(" - "), sum];
}

function next_xy(x, y)
{
    if (x < (max_x  - 1))
    {
        return [x + 1, y];
    }

    if (y < (max_y - 1))
    {
        return [0, y + 1];
    }

    return null;
}

function next_empty(_f, x, y)
{
    x++;
    for (; y < max_y; y++)
    {
        for (; x < max_x; x++)
        {
            if (field(_f, x, y) === STATE_EMPTY)
            {
                return [x, y];
            }
        }
        x = 0;
    }
    return null;
}

function put(_f, x, y)
{
    set_field(_f, x, y, STATE_PUT)
    dead_horizontal(_f, y);
    dead_vertical(_f, x);
    dead_slanting(_f, x, y);
}

function dead_horizontal(_f, y)
{
    for (var x = 0; x < max_x; x++)
    {
        if (field(_f, x, y) === STATE_EMPTY)
        {
            set_field(_f, x, y, STATE_DEAD);
        }
    }
}

function dead_vertical(_f, x)
{
    for (var y = 0; y < max_y; y++)
    {
        if (field(_f, x, y) === STATE_EMPTY)
        {
            set_field(_f, x, y, STATE_DEAD);
        }
    }
}

function dead_slanting(_f, x, y)
{
    var wx, wy ;

    wx = x - 1;
    wy = y - 1;
    for ( ; wx >= 0 && wy >= 0; wx--, wy--)
    {
        if (field(_f, wx, wy) === STATE_EMPTY)
        {
            set_field(_f, wx, wy, STATE_DEAD);
        }
    }

    wx = x - 1;
    wy = y + 1;
    for ( ; wx >= 0 && wy < max_y; wx--, wy++)
    {
        if (field(_f, wx, wy) === STATE_EMPTY)
        {
            set_field(_f, wx, wy, STATE_DEAD);
        }
    }

    wx = x + 1;
    wy = y + 1;
    for ( ; wx < max_x && wy < max_y; wx++, wy++)
    {
        if (field(_f, wx, wy) === STATE_EMPTY)
        {
            set_field(_f, wx, wy, STATE_DEAD);
        }
    }

    wx = x + 1;
    wy = y - 1;
    for ( ; wx < max_x && wy >= 0; wx++, wy--)
    {
        if (field(_f, wx, wy) === STATE_EMPTY)
        {
            set_field(_f, wx, wy, STATE_DEAD);
        }
    }

}

function draw_field(_f, hot_x, hot_y)
{
    var i = 0;
    for (var y = 0; y < max_y; y++)
    {
        for (var x = 0; x < max_x; x++)
        {
            var state = _f[i++];
            if (x === hot_x && y == hot_y) {
                state = STATE_HOT;
            }
            draw_cell(x, y, state);
        }
    }
}

function draw_cell(x, y, state)
{
    ctx.fillStyle = color[state];
    ctx.fillRect(x * WIDTH_X, y * WIDTH_Y, WIDTH_X - 3, WIDTH_Y - 3);
}

function draw_field_thumb(f)
{
    var c = $('<canvas width="100" height="100" style="float: left;"></canvas>');
    var _canvas = $(c)[0];
    var _ctx = _canvas.getContext('2d');

    var i = 0;
    for (var y = 0; y < max_y; y++)
    {
        for (var x = 0; x < max_x; x++)
        {
            var state = f[i++];
            draw_cell_thumb(_ctx, x, y, state);
        }
    }

    $('#ans_thumb').append(c);
}

function draw_cell_thumb(_ctx, x, y, state)
{
    var cell_width_x = 10;
    var cell_width_y = 10;

    _ctx.fillStyle = color[state];
    _ctx.fillRect(x * cell_width_x, y * cell_width_y, cell_width_x - 2, cell_width_y - 2);
}

function serialize(f)
{
    var data = "";
    for (var y = 0; y < f.length; y++)
    {
        for (var x = 0; x < f[y].length; x++)
        {
            data = data + f[y][x];
        }
    }
    return data;
}

function field(_f, x, y)
{
    var pos = x + (y * max_x);
    return _f[pos];
}

function set_field(_f, x, y, state)
{
    var pos = x + (y * max_x);
    _f[pos] = state;
}

function array_clone(a)
{
    var clone = [];
    for (var i = 0, len = a.length; i < len; i++)
    {
        clone[i] = a[i];
    }

    return clone;
}

function to_xy(i)
{
    var y = Math.floor(i / max_x);
    var x = i % max_x;

    return [x, y];
}

function reset()
{
    clearInterval(timer_id);

    max = 0;
    current_fields = [];

    fpush(_field, -1, 0);
    draw_field(_field);

    $('#ans_thumb').empty();

}

function mouse_event() {
    var mouseX;
    var mouseY;
    canvas.onmousemove = mouseMoveListner;
    function mouseMoveListner(e) {
        //座標調整
        adjustXY(e);
        $('#debug').html("mouseX: " + mouseX + " mouseY: " + mouseY);
    }


    function adjustXY(e) {
        var rect = e.target.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
}
