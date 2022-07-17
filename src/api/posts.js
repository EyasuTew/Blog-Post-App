const express = require('express');
const { Post, UserPost } = require('../db/models');
const auth = require('../middlewares')

const {
  updateValuesHelper,
  updateAssociationsHelper,
} = require('./services/posts_services');
const router = express.Router();

/**
 * Create a new blog post
 * req.body is expected to contain {text: required(string), tags: optional(Array<string>)}
 */
 //auth.auth()
router.post('/', async (req, res, next) => {
  try {
    // Validation
    if (!req.user) {
      return res.sendStatus(401);
    }

    const { text, tags } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ error: 'Must provide text for the new post' });
    }

    // Create new post
    const values = {
      text,
    };
    if (tags) {
      values.tags = tags.join(',');
    }
    const post = await Post.create(values);
    await UserPost.create({
      userId: req.user.id,
      postId: post.id,
    });

    res.json({ post });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  
   authorIds=req.query.authorIds;
   sortBy=req.query.sortBy;
   direction=req.query.direction;

  if (!req.user) {
    return res.status(401).json({ error: 'Not Authorized' });
  }else{

  if (!authorIds) {
    return res
      .status(400)
      .json({ error: 'Must provide authorIds for the posts' });
  }else{
    console.log(authorIds)
    const authorIdsInt = authorIds.split(',')//.map(Number);
    const posts = await Post.getPostsByUserId(authorIdsInt, sortBy, direction);
    //postsauthorIds=[1,2,3]
    posts.map((post)=>post.tags=post.tags.split(","))
    return res.json({ posts });
  }
}


  // Post.getPostsByUserId
  // Post.findAll(
  //   {
  //     include: [
  //       {
  //         model: UserPost,
  //         attributes: [],
  //         where: {
  //           userId: [authorIds],
  //         },
  //       },
  //     ],
  //   }
  // ).
  // then(function(data) {
  //    res.json(data)
  // }).catch(function(err) {
  //   res.json({"error":err})
  // });

});


/*
* Request sent to API, and if no err, it will return success 
*
*/

// router.patch("/:postId",(req, res) => {
//   if (!req.user) {
//     return res.sendStatus(401);
//   }
//   console.log("user =="+req.user.id)
//   console.log(req.user)
//   console.log(req.user.id)

//   console.log("tagId is set to " + req.params.postId);

//   Post.findOne({ where: { id:   req.params.postId} }).
//   then(function(post) {
//     //check if post is null
//     if(!post){
//       //res
//       res.status(404).json({"error":"Post not found"})
//     }else{

//       Post.findOne({
//         include: [
//           {
//             model: UserPost,
//             attributes: [],
//             where: {
//               userId: [req.user.id],
//               postId: post.id
//             },
//           },
//         ],
//       }).then(function(data){
//         if(!data){
//           res.status(401).json({"error":"Unauthorized operation"})
//         }else{
//           //res.json({"data":data})
//           Post.update(
//             { text:req.body.text },
//             { where:{ id : req.params.postId } },
//             { multi: false }
//           )
//           .then(function(rowsUpdated) {
//             console.log("update res")
//             console.log(rowsUpdated)
//             Post.findOne({ where: { id:   req.params.postId} }).
//             then(function(recentData){
//               res.json(recentData)
//             })
//           })
//           .catch(function(err){
//             res.json(err)
//           })
//         }
//       })
//     }
//     // console.log("post")
//     // console.log(post)
//     // res.json(post)

    

//     // check if user is auther of the post
//     /*Post.update(
//       { text:'a very different title now' },
//       { where:{ id : 1 } },
//       { multi: false }
//     )
//     .then(function(rowsUpdated) {
//       res.json(post)
//     })
//     .catch(function(err){
//       res.json(err)
//     })*/
    
//  }).catch(function(err) {
//    res.json({"error":err})
//  });

//   /*.on('success', function (post) {
//     // Check if record exists in db
//     if (post) {
//       post.update({
//         title: 'a very different title now'
//       })
//       .success(function (suc) {
//         console.log("suc="+suc)
//       })
//       .catch(function(err){
//         console.log("err="+err)
//       })
//     }
//   })*/

//   //res.json({"e":"e"})
// })


router.patch('/:postId', async (req, res, next) => {
  try {
    // Authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authorized' });
    }
    const postId  = req.params.postId;
    const authorIds = req.body.authorIds;
    const tags = req.body.tags;
    const text = req.body.text;

    const postCheckExist = await Post.findOne({
      where: {
        id: postId,
      },

    });
    // Check if post exists
    if (!postCheckExist) {
      return res
        .status(404)
        .json({ error: 'Post not found' });
    }

    const post = await Post.findOne({
      where: {
        id: postId,
      },
      include: [
        {
          model: UserPost,
          where: {
            userId: req.user.id,
          },
        },
      ],
    });

    // Check if post exists
    if (!post) {
      return res
        .status(401)
        .json({ error: 'User not authorized to perform this operation' });
    }

    // Update post
    if (authorIds) {
      await updateAssociationsHelper(post, authorIds, req.user.id);
    }
    //const values = await updateValuesHelper({ tags, text });
    let updateValues={}
    if(text){
      updateValues["text"]=req.body.text
    }
    if(tags){
      updateValues["tags"]=req.body.tags.join(",")
    }
    if (text || tags) {
      await Post.update(
        //{ text:req.body.text,tags:req.body.tags.join(",")},
        updateValues,
        { where:{ id : req.params.postId } },
        { multi: false }
      )
    }


    const updatedPost = await Post.findOne({
      where: {
        id: postId,
      },

    })
    //.then(function(post) {
      console.log(updatedPost)
      updatedPost.dataValues.tags =updatedPost.dataValues.tags.split(",")
    //})
    // Serialize post
    const serialize = updatedPost.get({ plain: true });
    //serialize.tags = updatedPost.map((post) => post.tags.split(","));

    let userposts = await UserPost.findAll({
      where: {
        postId,
      },
      attributes: ['userId'],
    });
    serialize.authorIds = userposts.map((userpost) => userpost.userId);
    delete serialize.user_posts;
    res.json({
      post: serialize,
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({ error: 'Author or User not found' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: "Error on values or Invalid values" });
    }
    next(error);
  }
});


router.get('/ping',(req, res) => {
  let tag = req.query.tag;
  res.setHeader('Content-Type', 'application/json');
  helper.getData(htc_url,{tag}).then(data => {
      res.send({"success": true}).statusCode(200)
  }).catch(data => {
      res.send({"success": false}).statusCode(500)
  })
  
})
module.exports = router;
