<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use PDO;

class CourseSort{
    protected $allowedParamaters = [
        'name' => ['asc', 'desc'],
        'created_at' => ['asc', 'desc']
    ];

    protected $operatorMap = [
        'asc',
        'desc'
    ];


    //TODO: maybe add errors for more than one query
    public function transform($builder, Request $request){
        $sortBy = "created_at";
        $sortDirection = "desc";
        
        foreach($this->allowedParamaters as $parms => $operator){
            if($request->query($parms)){
                $query = $request->query($parms);
                $sortBy = $parms;

                foreach($this->operatorMap as $operator){
                    if(isset($query[$operator])){
                        $sortDirection = $operator;
                        break;
                    }
                }
            }
        }


        return $builder->orderBy($sortBy,$sortDirection);
    }
}
