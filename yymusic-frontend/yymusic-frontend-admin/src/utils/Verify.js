const regs = {
	email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
	number: /^\+?[1-9][0-9]*$/,
	password: /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*_]{8,}$/,
	version: /^[0-9\.]+$/,
	floatNumber: /^\d*(\.\d{0,2})?$/,
}

const verify = (rule, value, reg, callback) => {
	if (value) {
		if (reg.test(value)) {
			callback()
		} else {
			callback(new Error(rule.message))
		}
	} else {
		callback() // 非必填项为空时不校验正则
	}
}

export default {
	regs,
	verify,
	password: (rule, value, callback) => verify(rule, value, regs.password, callback),
	number: (rule, value, callback) => verify(rule, value, regs.number, callback),
	floatNumber: (rule, value, callback) => verify(rule, value, regs.floatNumber, callback),
}
