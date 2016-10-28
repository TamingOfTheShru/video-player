var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var clipSchema = new Schema({
	name:{
		type: String
	},
  	clip: {
  		type: Buffer
  	}
});



module.exports = mongoose.model('Clip', clipSchema);