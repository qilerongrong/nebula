(function( $ ) {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
        this.element.hide();
        var me = this;
        this.element.change(function(){
        	var selected = $(this).children( ":selected" );
        	value = selected.val()?selected.text():"";
        	me.input.val(value);
        });
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
        value = selected.val()?selected.text():"";
        var emptyText = this.element.children( "[value='']" ).text();
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .attr("placeholder",emptyText)
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });
        this.input.click(function(){
            $(this).select();
        })
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
            this.element.trigger( "change");
            return false;
          }
          // autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "显示所有选项" )
          // .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          var val = $(this).val();
          if (!request.term || matcher.test(text) || matcher.test(val))
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        var selectedValue = "";
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            selectedValue = $( this ).val()
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
        	if(selectedValue == "" || value == null){
        		this.input.val( "" )
        	}
          return;
        }
 
        // Remove invalid value
        this.input
          .val( "" ).attr("title","没有\""+value+"\"选项，请选择或输入正确的选项。");
        this.input.tooltip({position:{my:'left top-40',at:'left top'}}).tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr("title","");
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
      },
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
  })( jQuery);