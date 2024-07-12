const Joi = require("joi");

const schema = Joi.object({
  email: Joi.string().min(5).max(255).required().email(),
  password: Joi.string().min(5).max(255).required(),
});

const user = {
  email: "s@gmail.com",
  password: "1254",
};

const { error } = schema.validate(user);
if (error) console.log(error.details[0].message);
