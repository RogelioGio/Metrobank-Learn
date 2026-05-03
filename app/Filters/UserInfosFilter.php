<?php

namespace App\Filters;

use Illuminate\Http\Request;

class UserInfosFilter{
    protected $allowedParamaters = [
        'title_id' => ['eq'],
        'department_id' => ['eq'],
        'branch_id' => ['eq'],
        'section_id' => ['eq'],
        'division_id' => ['eq'],
        'career_level_id' => ['eq']
    ];

    protected $parameterMap = [
        'career_level_id' => 'career_level',
        'department_id' => 'department',
        'division_id' => 'division'
    ];

    protected $whereMap = ['title_id', 'branch_id', 'section_id'];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'gt' => '>',
        'lte' => '<=',
        'gte' => '>=',
    ];

    public function transform($builder, Request $request){
        $eloQuery = [];

        foreach($this->allowedParamaters as $parm => $operators){
            $query = $request->query($parm);

            if(!isset($query)){
                continue;
            }

            // foreach ($operators as $operator){
            //     if(isset($query[$operator])){
            //         $eloQuery[] = [$parm, $this->operatorMap[$operator], $query[$operator]];
            //     }
            // }

            foreach ($operators as $operator){
                if(isset($query[$operator])){
                    if(in_array($parm, $this->whereMap)){
                        $builder->where($parm, $this->operatorMap[$operator], $query[$operator]);
                        continue;
                    }
                    // $builder->whereHas($this->parameterMap[$parm], function($queryy) use($operator, $parm, $query){
                    //     $queryy->where($parm, $this->operatorMap[$operator], $query[$operator]);
                    // });
                    if (isset($this->parameterMap[$parm])) {
                        switch ($parm) {
                            case 'department_id':
                                $builder->whereHas('title.department', function ($q) use ($operator, $parm, $query) {
                                    $q->where('id', $this->operatorMap[$operator], $query[$operator]);
                                });
                                break;

                            case 'division_id':
                                $builder->whereHas('title.department.division', function ($q) use ($operator, $parm, $query) {
                                    $q->where('id', $this->operatorMap[$operator], $query[$operator]);
                                });
                                break;

                            case 'career_level_id':
                                $builder->whereHas('careerLevel', function ($q) use ($operator, $parm, $query) {
                                    $q->where('id', $this->operatorMap[$operator], $query[$operator]);
                                });
                                break;

                            default:
                                $builder->whereHas($this->parameterMap[$parm], function ($q) use ($operator, $parm, $query) {
                                    $q->where('id', $this->operatorMap[$operator], $query[$operator]);
                                });
                                break;
                        }
                    } else {
                        // Direct columns like title_id, branch_id, etc.
                        $builder->where($parm, $this->operatorMap[$operator], $query[$operator]);
                    }
                }
            }
        }

        return $builder;
    }
}
