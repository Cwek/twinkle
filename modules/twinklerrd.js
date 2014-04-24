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
    
    var Window = new Morebits.simpleWindow( 400, 300 );
	Window.setTitle( "批量申请特定版本删除删除" );
	//Window.setScriptName( "Twinkle" );
	//Window.addFooterLink( "Twinkle帮助", "WP:TW/DOC#delimages" );
    
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
				label: '选择前后版本并查询相关版本',
				name: 'SelectMode',
				value: '2',
				checked: false
			}
		]
	} );
    form.append( {
		type: 'checkbox',
		list: [
			{
				label: '编辑内容',
				name: 'ToDelete',
				value: 'content',
				checked: false
			},
			{
				label: '编辑者',
				name: 'ToDelete',
				value: 'editor',
				checked: false
			},
            {
				label: '编辑摘要',
				name: 'ToDelete',
				value: 'summary',
				checked: false
			}
		]
	} );
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
    /*
	form.append( {
		type: 'input',
		name: 'OtherReason',
		label: '请输入其他理由'
	} );
    */
    
    form.append( { type:'submit' } );
    var result = form.render();
	Window.setContent(result);
	Window.display();   
    
    var evt = document.createEvent( "Event" );
	evt.initEvent( 'change', true, true );
	result.category.dispatchEvent( evt );
}

Twinkle.rrd.ReasonForOther=function rdReasonOther(e){
    //var value = e.target.value;
	var form =e.target.form;
    var $divReasonOther=$(form).find("div#ReasonOther");
    var $reason=$(Morebits.quickForm.getElements(form,"Reason")[0]);
    var reason=$reason.find("option:selected").first().val();
    
    if(reason=='other')
    {
        form.append( {
            type: 'input',
            name: 'OtherReason',
            label: '请输入其他理由'
        } );
    };
};

Twinkle.rrd.callbacks = {
    main: function( pageobj ) {
        var params = pageobj.getCallbackParameters();
        var rev_values=$("input.tw-rrd-selectrid");
        
        wikipedia_page = new Morebits.wiki.page("Wikipedia:修订版本删除请求", "添加项目");
        wikipedia_page.setFollowRedirect(true);
        wikipedia_page.setCallbackParameters(params);
        var addtext="";
        
        
        wikipedia_page.setAppendText(addtext);
        wikipedia_page.setEditSummary("添加[[" + Morebits.pageNameNorm + "]]的版本提出。" + Twinkle.getPref('summaryAd'));
        
        //wikipedia_page.load(Twinkle.xfd.callbacks.afd.todaysList);
    }
};

Twinkle.rrd.callback.evaluate = function twrrdCallbackEvaluate(e) {
    var form = e.target;
	var params = {};
	
    Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( form );

	Morebits.wiki.actionCompleted.notice = "提交完成，在几秒内刷新页面";
    
    Morebits.wiki.addCheckpoint();
    var wikipedia_page = new Morebits.wiki.page('Wikipedia:修订版本删除请求', "正在提交");
	wikipedia_page.setCallbackParameters(params);	
    wikipedia_page.load(Twinkle.rrd.callbacks.main);
    Morebits.wiki.removeCheckpoint();
};
})(jQuery);
//</nowiki>
