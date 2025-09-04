export default {
	/**************
	method: veda
	params: packet
	describe: The global wall feature that installs with every agent
	***************/
	async veda(packet) {
		const veda = await this.methods.sign('veda', 'default', packet);
		return veda;
	},
};
