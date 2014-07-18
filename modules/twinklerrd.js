//<nowiki>

(function($){


/*
 ****************************************
 *** twinklerrd.js: RevisionDelete module
 ****************************************
 * Mode of invocation:     Tab ("rrd")
 * Active on:              History Page
 */

Twinkle.rrd = function twinklerrd() {
    if(wgAction=='history')
    {
        Twinkle.addPortletLink(Twinkle.rrd.callback,'提特版删','tw-rrd','申请页面特定版本删除');
    }
};

Twinkle.rrd.callback=function rrdcallback(){
    Twinkle.rrd.initSelectInput();

    var Window = new Morebits.simpleWindow( 500, 400 );
    Window.setTitle( "批量申请特定版本删除删除" );
    Window.setScriptName( "Twinkle" );
    Window.addFooterLink( "关于申请页面特定版本删除", "WP:RRD" );

    var form = new Morebits.quickForm( Twinkle.rrd.callback.evaluate );

    form.append( {
        type: 'radio',
        list: [
            {
                label: '选择特定版本',
                name: 'SelectMode',
                value: '1',
                checked: true
            },
            {
                label: '选择前后版本并查询相关版本（至少两个，两个以上会选取最大和最小的版本号）',
                name: 'SelectMode',
                value: '2',
                checked: false
            }
        ]
    } );

    content_work_area =new Morebits.quickForm.element( {
                            type: 'field',
                            label: '移除内容',
                            name: 'content_work_area'
                        } );
    content_work_area.append( {
        type: 'checkbox',
        list: [
            {
                label: '编辑内容',
                name: 'ToDelete',
                value: '编辑内容',
                checked: false
            },
            {
                label: '编辑者',
                name: 'ToDelete',
                value: '编辑者',
                checked: false
            },
            {
                label: '编辑摘要',
                name: 'ToDelete',
                value: '编辑摘要',
                checked: false
            }
        ]
    } );
    form.append(content_work_area);

    form.append( {
        type:'select',
        name:'Reason',
        label:'删除原因',
        multiple:false,
        event:Twinkle.rrd.ReasonForOther,
        list:[
            {
                type: 'option',
                label:'RD1：侵犯版权',
                value:'rd1'
            },
            {
                type: 'option',
                label:'RD2：针对个人、团体或组织的严重侮辱、贬低或攻击性材料',
                value:'rd1'
            },
            {
                type: 'option',
                label:'RD3：纯粹的扰乱性内容',
                value:'rd2'
            },
            {
                type: 'option',
                label:'RD4：非公开的私人信息',
                value:'rd3'
            },
            {
                type: 'option',
                label:'RD4：非公开的私人信息：用户编辑未登录，泄漏IP地址',
                value:'rd4'
            },
            {
                type: 'option',
                label:'RD5：删除守则下的有效删除，使用RevisionDelete执行',
                value:'rd5'
            },
            {
                type: 'option',
                label:'RD6：版本删除校正',
                value:'rd6'
            },
            {
                type: 'option',
                label:'其他原因',
                value:'other'
            }
        ]
    });

    form.append({ type: 'div', id: 'ReasonOther' });

    form.append( {
        type: 'input',
        name: 'Other',
        label: '其他补充信息'
    } );

    form.append( { type:'submit' } );
    var result = form.render();
    Window.setContent(result);
    Window.display();

    var evt = document.createEvent( "Event" );
    evt.initEvent( 'change', true, true );
    result.dispatchEvent( evt );
}

Twinkle.rrd.ReasonForOther=function rdReasonOther(e){
    //var value = e.target.value;
    var form =e.target.form;
    var $divReasonOther=$(form).find("div#ReasonOther");
    var $reason=$(Morebits.quickForm.getElements(form,"Reason")[0]);
    var reason=$reason.find("option:selected").first().val();
    var div = new Morebits.quickForm.element({ type: 'div', id: 'ReasonOther' });

    if(reason=='other')
    {
        div.append( {
            type: 'input',
            name: 'OtherReason',
            label: '请输入其他理由'
        });
    }

    $divReasonOther.replaceWith(div.render());
};

Twinkle.rrd.getSelectArray=function(){
    var rev_inputs=$("input.tw-rrd-selectrid");
    var rev_values=new Array();
    var count=0;
    rev_inputs.each(function(){
        var rev_input=$(this);
        if(rev_input.is(":checked"))
            rev_values[count++]=$(this).val();
    });
    rev_values.sort();

    return rev_values;
};

Twinkle.rrd.cleanSelectInput=function(){
    $("input.tw-rrd-selectrid").remove();
};

Twinkle.rrd.initSelectInput=function(){
    var li_revs=$("ul#pagehistory li");
    li_revs.each(function(){
        var li_rev=$(this);
        var rev_value=li_rev.find("input[name='oldid']").val();

        var checkbox=$("<input>");
        checkbox
            .attr("type","checkbox")
            .attr("name","selectrid")
            .addClass("tw-rrd-selectrid")
            .attr("value",rev_value);

        var insert=li_rev.find("span.mw-history-histlinks");

        insert.after(checkbox);
    });
};

Twinkle.rrd.callbacks = {
    main: function( pageobj ) {
        var params = pageobj.getCallbackParameters();

        var rev_values=params.rev_values;
        var todelete=params.todelete;
        var reason_str=params.reason;
        var otherReason_str=params.otherReason;
        var other_str=params.other;

        wikipedia_page = new Morebits.wiki.page("Wikipedia:修订版本删除请求", "添加项目");
        wikipedia_page.setFollowRedirect(true);
        wikipedia_page.setCallbackParameters(params);
        var addtext_model="{{Revdel\n"+
                    "|status = \n"+
                    "|article = {1}\n"+
                    "{0}\n"+
                    "|set={2}\n"+
                    "|reason={3}\n"+
                    "}}\n"+
                    "{4}"
                    "--~~~~";
        String.prototype.format=function(list){
            var args = list;
            return this.replace(/\{(\d+)\}/g,
                function(model,i){
                    return args[i];
                });
        };

        var ToDelete_arr=[];
        todelete.each(function(ele,index){
            ToDelete_arr.push($(this).val());
        });
        var todelete_str=ToDelete_arr.join("，");

        var rev_value_strarr=[];
        var count=0;
        rev_values.map(function(value, index, array){
            rev_value_strarr.push("|id{0}={1}".format([count++,value]));
        });

        var addtext=addtext_model.format([
            rev_value_strarr.join("\n"),
            Morebits.pageNameNorm,
            todelete_str,
            (reason_str=='other'?otherReason_str:reason_str),
            (other_str!=""?other_str+"\n":"")
        ]);
        //console.log(addtext);
        wikipedia_page.setAppendText(addtext);
        wikipedia_page.setEditSummary("添加[[" + Morebits.pageNameNorm + "]]的版本提出。" + Twinkle.getPref('summaryAd'));

        wikipedia_page.append();
    }
};

Twinkle.rrd.callback.evaluate = function twrrdCallbackEvaluate(e) {
    var form = e.target;
    var params = {};

    var rev_values=Twinkle.rrd.getSelectArray();
    var selectmode=$(form).find("input[name=SelectMode]:checked").val();
    var todelete=$(form).find("input[name=ToDelete]:checked");
    var reason=$(form).find("select[name=Reason] option:selected").val();
    var otherReason="";
    if(reason=='other')
    {otherReason=$(form).find("input[name=OtherReason]").val();}
    var other=$(form).find("input[name=Other]").val();

    if(todelete.length<=0)
    {
        alert("请至少选择一个删除内容");
        return;
    }
    if(rev_values.length<=0)
    {
        alert("请至少选择一个历史记录");
        return;
    }
    else
    {
        if(selectmode=="2")
        {
            if(rev_values.length==1)
            {
                alert("按照前后版本选择，请选择超过2个选项");
                return;
            }
            var max_rev,min_rev;
            if(rev_values.length==2)
            {
                min_rev=rev_values[0];
                max_rev=rev_values[1];
            }
            else
            {
                min_rev=rev_values[0];
                max_rev=rev_values[rev_values.length-1];
            }
            var query={
                'action':'query',
                'prop':'revisions',
                'rvprop':'ids',
                'rvstartid':max_rev,
                'rvendid':min_rev,
                'titles': Morebits.pageNameNorm,
                'rvlimit' : 500
            };
            var apiquery=new Morebits.wiki.api('抓取历史', query,function(self){
                var xmlDoc = self.responseXML;
                var snapshot = xmlDoc.evaluate('//api/query/pages/page/revisions/rev', xmlDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );
                var list = [];

                for ( var i = 0; i < snapshot.snapshotLength; ++i ) {
                    var object = snapshot.snapshotItem(i);
                    var rev_value = xmlDoc.evaluate( '@revid', object, null, XPathResult.STRING_TYPE, null ).stringValue;
                    list.push(rev_value);
                }

                rev_values=list;
            });
            apiquery.post();
        }
        params={
                'rev_values':rev_values,
                'todelete':todelete,
                'reason':reason,
                'otherReason':otherReason,
                'other':other
                };
    }

    Morebits.simpleWindow.setButtonsEnabled( false );
    Morebits.status.init( form );

    Morebits.wiki.actionCompleted.notice = "提交完成，在几秒内刷新页面";
    Morebits.wiki.actionCompleted.redirect = 'Wikipedia:修订版本删除请求';

    Morebits.wiki.addCheckpoint();
    var wikipedia_page = new Morebits.wiki.page('Wikipedia:修订版本删除请求', "正在提交");
    wikipedia_page.setCallbackParameters(params);
    wikipedia_page.load(Twinkle.rrd.callbacks.main);
    Morebits.wiki.removeCheckpoint();
    Twinkle.rrd.cleanSelectInput();
};
})(jQuery);
//</nowiki>
