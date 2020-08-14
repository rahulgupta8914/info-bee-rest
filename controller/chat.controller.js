const {Conversation, Message} = require("../models/Message");
const asyncMiddleware = require("../middleware/async");

const createConversation = asyncMiddleware(async (req, res, next) => {
    // i will add validation later
    const { otherUserId } = req.body;
    const data = await Conversation.findOne({members:{$all: [req.user._id,otherUserId]}}).populate("members")
    if(data){
        res.send({
            message: "conversation found!",
            conversation: data
        })
    } else {
        const conversation = await new Conversation({
            members: [
                req.user._id, otherUserId
            ]
        }).save();
    const temp = await Conversation.findOne(conversation).populate("members")
        res.send({
            message: "conversation created!",
            conversation: temp
        })
    }
})

const getConversationList = asyncMiddleware(async (req, res, next) => {
    // i will add validation later
    const data = await Conversation.find({members:{$in: [req.user._id]}}).populate("members")
    res.send({
        conversations: data
    })
})

const sendMessage = asyncMiddleware(async (req, res, next) => {
    // i will add validation later
    const conversationId = "5f367402e9dcd414c6aaf347";
    const consversion = await Conversation.findById(conversationId)
    if(consversion){
        const { members } = consversion;
        if(members.includes(req.user._id)){
            const newMessage = new Message({
            author: req.user._id,
            body: req.body.body,
            conversation: conversationId
        });
        const message = await newMessage.save();
        res.send({
                message: "message successfully send!",
                messageBody: message
            })
        } else  {
            res.status(400).send({
                message: "bad action! reported!",
            })
        }
    } else {
        res.status(400).send({message: "conversation not found!"})
    }
})

const fetchMessages = asyncMiddleware(async (req, res, next) => {
    // i will add validation later
    const conversationId = "5f367402e9dcd414c6aaf347";
    const resPerPage = 9; // results per page
    const limit = 2
    const messages = await Message.find({conversation: conversationId})
    .populate("author")
    .limit(limit)
    // .skip((resPerPage * page) - resPerPage)
    // .sort('-createdAt')
    res.send({messages})
})

module.exports = { createConversation, getConversationList, sendMessage, fetchMessages };