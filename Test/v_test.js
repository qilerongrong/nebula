function testClass(){
	V.log('testClass begin...');
    V.Classes.create({
	    className:"A.AA",
		init:function(name,age){
		    this.name = name;
			this.age = age;
			this.getNS = function(){
			    return "A";
			}
		}
	});
    V.Classes['A.AA'].prototype.readName = function(){
	    V.log("name============"+this.name);
	};
	 V.Classes['A.AA'].prototype.write = function(){
	    V.log('A:call write...'+this.getNS());
	}
	V.Classes.create({
	    className:"B",
		superClass:"A.AA",
		init:function(name,age,address){
		    this.address = address;
		}
	});
	V.Classes.B.prototype.readAddress = function(){
	    V.log("address============"+this.address);
	};
	V.Classes.B.prototype.write = function(){
	    V.log("method write has been overwrote by Clase B...");
	};
	
	V.Classes.create({
	    className:"C",
		superClass:"B",
		init:function(name,age,address,sex){
		    this.sex = sex;
		}
	});
	V.Classes["C"].prototype.isMale = function(){
	    V.log("call isMale..."+this.sex);
	    return this.sex == "male";
	}
	var a = new V.Classes['A.AA']("victor","25");
	a.readName();
	a.write();
	var b = new V.Classes.B("alex","26","xxx");
	b.readName();
	b.write();
	b.readAddress();
	var c = new V.Classes["C"]("jack","25","xxx","male");
	c.readName();
	c.isMale();
	V.log("NS..."+c.getNS());
}
function testDialog(){
    V.loadPlugin('v.ui.dialog',function(){
	    var dialog = new V.Classes['v.ui.Dialog']();
		dialog.init({title:'Test'});
		dialog.open();
	});
}
(function run(){
    testClass();
	//testDialog();
})()