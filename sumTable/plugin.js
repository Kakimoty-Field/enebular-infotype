
//
// infomotion などで infotype を設定するときの、デフォルトフィールド名
SumTable.defaultSettings = {
    "label": "category",
    "value": "value"
};

//
// この infotype で設定可能な項目（スキーマ）の列挙
SumTable.settings = EnebularIntelligence.SchemaProcessor([
    {
        type: "key", name: "label", help: "Please specify the key of the data to be the label."
    }, {
        type: "key", name: "value", help: "Please specify the key of the data representing the value."
    }, {
        type: "select", name: "limit", help: "The number of data to be displayed", options: ["10", "20", "30", "all"]
    }
], SumTable.defaultSettings);

//
// コンストラクタ
function SumTable(settings, options) {

    var that = this;
    this.el = window.document.createElement('div');

    this.settings = settings;
    this.options = options;
    this.data = {};

    this.width = (options.width || 500) - 50;
    this.height = (options.height || 300) - 50;

    // この infotype が描画する table タグを準備
    this.table = window.document.createElement('table');
    this.el.append(this.table);

}

//
// データ更新イベント
//  addData は追加されたデータではなく、infomotion で指定された時間範囲のデータが配列で格納されています。
SumTable.prototype.addData = function (data) {
    var that = this;

    var label = this.settings.label;
    var value = this.settings.value;

    if (data instanceof Array) {
        this.data = {};
        data.forEach( (d) =>
        {
            if( ! that.data[ d[label] ] )
                that.data[ d[label] ] = 0;
            that.data[ d[label] ] += d[value]; // 各ラベルカテゴリごとの値の合計値を計算してく
        });
        this.refresh();
    }

}

//
// データクリアイベント
SumTable.prototype.clearData = function () {
    this.data = {};
    this.refresh();
}

//
// ブラウザサイズ変更イベント
SumTable.prototype.resize = function (options) {
    var that = this;
    this.width = options.width - 50;
    this.height = options.height - 50;

    this.refresh();
}

//
// infotype を再描画するメソッド( API ではない )
SumTable.prototype.refresh = function () {
    var that = this;
    var table = this.table;

    // 前回描画したテーブルを一旦削除
    while (table.firstChild) table.removeChild(table.firstChild);

    // テーブルタグに CSS Style 設定
    this.table.style.cssText = `width:${ this.width }; height:${this.height};`

    // 縦方向の表。
    for(var key in that.data )
    {
        var tr = window.document.createElement('tr');

        var th = window.document.createElement('th');
        th.textContent = key;
        tr.appendChild(th);

        var td = window.document.createElement('td');
        td.textContent = that.data[key];
        tr.appendChild(td);

        table.append(tr);
    }
}

//
// このinfotype が扱う DOM を infomotion に教えるメソッド
SumTable.prototype.getEl = function () {
    return this.el;
}

window.EnebularIntelligence.register('SumTable', SumTable);

module.exports = SumTable;